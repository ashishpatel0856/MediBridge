const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../infrastructure/database/connection');
const { NotFoundError, ConflictError, BadRequestError } = require('../domain/errors/app-errors');

// Atomic Slot Booking with PostgreSQL Transaction & Row-level Lock
const bookSlotTransaction = async ({
  slotId,
  patientId,
  symptoms,
  notes,
  paymentMethod = 'UPI',
  isPendingPayment = false,
  stripePaymentIntentId = null,
  consultationFee = 500.0,
  consultationId = uuidv4(),
  paymentId = uuidv4()
}) => {
  const db = getDb();
  const txRef = `TXN-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  const meetingLink = `https://meet.amrutam.co.in/room-${consultationId.slice(0, 8)}`;

  let consultation = null;
  let payment = null;
  let doctorId = '';

  await db.withTransaction(async (client) => {
    // SELECT ... FOR UPDATE locks the slot row preventing concurrent bookings
    const slotRes = await client.query(
      `SELECT id, doctor_id, start_time, end_time, is_booked 
       FROM availability_slots 
       WHERE id = $1 FOR UPDATE`,
      [slotId]
    );

    if (slotRes.rows.length === 0) {
      throw new NotFoundError('Availability slot not found');
    }

    const slot = slotRes.rows[0];
    if (slot.is_booked) {
      throw new ConflictError('This availability slot has already been booked');
    }

    if (new Date(slot.start_time) <= new Date()) {
      throw new BadRequestError('Cannot book a slot in the past');
    }

    doctorId = slot.doctor_id;

    // Fetch doctor fee if not passed
    const docRes = await client.query('SELECT consultation_fee FROM doctors WHERE id = $1', [doctorId]);
    if (docRes.rows.length > 0 && docRes.rows[0].consultation_fee) {
      consultationFee = parseFloat(docRes.rows[0].consultation_fee);
    }

    // Lock availability slot
    await client.query('UPDATE availability_slots SET is_booked = true, updated_at = NOW() WHERE id = $1', [
      slotId
    ]);

    const initialStatus = isPendingPayment ? 'PENDING_PAYMENT' : 'SCHEDULED';
    const initialPaymentStatus = isPendingPayment ? 'PENDING' : 'COMPLETED';

    const consultRes = await client.query(
      `INSERT INTO consultations (id, patient_id, doctor_id, slot_id, status, symptoms, notes, meeting_link, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
       RETURNING *`,
      [consultationId, patientId, doctorId, slotId, initialStatus, symptoms, notes || null, meetingLink]
    );
    consultation = consultRes.rows[0];

    const payRes = await client.query(
      `INSERT INTO payments (id, consultation_id, patient_id, amount, currency, status, transaction_reference, payment_method, stripe_payment_intent_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, 'INR', $5, $6, $7, $8, NOW(), NOW())
       RETURNING *`,
      [paymentId, consultationId, patientId, consultationFee, initialPaymentStatus, txRef, paymentMethod, stripePaymentIntentId]
    );
    payment = payRes.rows[0];
  });

  return { consultation, payment, doctorId };
};

// Confirm payment — moves consultation from PENDING_PAYMENT → SCHEDULED, payment PENDING → COMPLETED
const confirmPaymentTransaction = async (stripePaymentIntentId, patientId) => {
  const db = getDb();
  let consultation = null;
  let payment = null;

  await db.withTransaction(async (client) => {
    const payRes = await client.query(
      `UPDATE payments SET status = 'COMPLETED', updated_at = NOW()
       WHERE stripe_payment_intent_id = $1 AND patient_id = $2 AND status = 'PENDING'
       RETURNING *`,
      [stripePaymentIntentId, patientId]
    );

    if (payRes.rows.length === 0) {
      throw new NotFoundError('Pending payment not found');
    }
    payment = payRes.rows[0];

    const consultRes = await client.query(
      `UPDATE consultations SET status = 'SCHEDULED', updated_at = NOW()
       WHERE id = $1 AND status = 'PENDING_PAYMENT'
       RETURNING *`,
      [payment.consultation_id]
    );

    if (consultRes.rows.length === 0) {
      throw new NotFoundError('Consultation not found');
    }
    consultation = consultRes.rows[0];
  });

  return { consultation, payment };
};

// Find consultation by ID
const findConsultationById = async (consultationId) => {
  const db = getDb();
  const res = await db.query(
    `SELECT 
      c.*,
      s.start_time as "startTime", s.end_time as "endTime",
      pay.amount as "paymentAmount", pay.status as "paymentStatus", pay.transaction_reference as "transactionRef"
     FROM consultations c
     JOIN availability_slots s ON c.slot_id = s.id
     LEFT JOIN payments pay ON c.id = pay.consultation_id
     WHERE c.id = $1`,
    [consultationId]
  );
  return res.rows[0] || null;
};

// Update consultation status and handle cancellation rollback
const updateConsultationStatus = async (consultationId, targetStatus) => {
  const db = getDb();
  let updatedConsultation = null;

  await db.withTransaction(async (client) => {
    let updateQuery = 'UPDATE consultations SET status = $1, updated_at = NOW()';
    const params = [targetStatus];
    let idx = 2;

    if (targetStatus === 'IN_PROGRESS') {
      updateQuery += `, started_at = NOW()`;
    } else if (targetStatus === 'COMPLETED') {
      updateQuery += `, completed_at = NOW()`;
    }

    updateQuery += ` WHERE id = $${idx++} RETURNING *`;
    params.push(consultationId);

    const updated = await client.query(updateQuery, params);
    updatedConsultation = updated.rows[0];

    if (targetStatus === 'CANCELLED' && updatedConsultation) {
      await client.query('UPDATE availability_slots SET is_booked = false WHERE id = $1', [
        updatedConsultation.slot_id
      ]);
      await client.query("UPDATE payments SET status = 'REFUNDED' WHERE consultation_id = $1", [
        consultationId
      ]);
    }
  });

  return updatedConsultation;
};

// List consultations with filters
const listConsultations = async ({ userId, role, query }) => {
  const db = getDb();
  const page = query.page || 1;
  const limit = query.limit || 10;
  const offset = (page - 1) * limit;

  const conditions = [];
  const params = [];
  let idx = 1;

  if (role === 'PATIENT') {
    conditions.push(`c.patient_id = $${idx++}`);
    params.push(userId);
  } else if (role === 'DOCTOR') {
    conditions.push(`d.user_id = $${idx++}`);
    params.push(userId);
  }

  if (query.status) {
    conditions.push(`c.status = $${idx++}`);
    params.push(query.status);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countRes = await db.query(
    `SELECT COUNT(*) as total 
     FROM consultations c 
     JOIN doctors d ON c.doctor_id = d.id 
     ${whereClause}`,
    params
  );
  const total = parseInt(countRes.rows[0]?.total || 0, 10);

  const dataParams = [...params, limit, offset];
  const dataRes = await db.query(
    `SELECT 
      c.id, c.patient_id as "patientId", c.doctor_id as "doctorId", c.slot_id as "slotId",
      c.status, c.symptoms, c.notes, c.meeting_link as "meetingLink",
      c.started_at as "startedAt", c.completed_at as "completedAt", c.created_at as "createdAt",
      s.start_time as "startTime", s.end_time as "endTime",
      p.first_name as "doctorFirstName", p.last_name as "doctorLastName"
     FROM consultations c
     JOIN doctors d ON c.doctor_id = d.id
     JOIN profiles p ON d.user_id = p.user_id
     JOIN availability_slots s ON c.slot_id = s.id
     ${whereClause}
     ORDER BY c.created_at DESC
     LIMIT $${idx++} OFFSET $${idx++}`,
    dataParams
  );

  return {
    data: dataRes.rows,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 }
  };
};

module.exports = {
  bookSlotTransaction,
  confirmPaymentTransaction,
  findConsultationById,
  updateConsultationStatus,
  listConsultations
};
