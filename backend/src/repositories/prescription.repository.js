const { getDb } = require('../infrastructure/database/connection');

// Find doctor record by user ID
const findDoctorByUserId = async (userId) => {
  const db = getDb();
  const res = await db.query('SELECT id FROM doctors WHERE user_id = $1', [userId]);
  return res.rows[0] || null;
};

// Find consultation record by consultation ID
const findConsultationById = async (consultationId) => {
  const db = getDb();
  const res = await db.query('SELECT * FROM consultations WHERE id = $1', [consultationId]);
  return res.rows[0] || null;
};

// Check if a prescription already exists for a consultation
const findExistingPrescription = async (consultationId) => {
  const db = getDb();
  const res = await db.query('SELECT id FROM prescriptions WHERE consultation_id = $1', [consultationId]);
  return res.rows[0] || null;
};

// Atomic prescription creation with consultation completion
const createPrescriptionTransaction = async ({
  id,
  consultationId,
  doctorId,
  patientId,
  diagnosis,
  medications,
  instructions,
  followUpDate,
  digitalSignature,
  createdAt
}) => {
  const db = getDb();
  let prescription = null;

  await db.withTransaction(async (client) => {
    const rxRes = await client.query(
      `INSERT INTO prescriptions (id, consultation_id, doctor_id, patient_id, diagnosis, medications, instructions, follow_up_date, digital_signature, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, consultation_id as "consultationId", doctor_id as "doctorId", patient_id as "patientId",
                 diagnosis, medications, instructions, follow_up_date as "followUpDate",
                 digital_signature as "digitalSignature", created_at as "createdAt"`,
       [
         id,
         consultationId,
         doctorId,
         patientId,
         diagnosis,
         JSON.stringify(medications),
         instructions || null,
         followUpDate || null,
         digitalSignature,
         createdAt
       ]
    );
    prescription = rxRes.rows[0];

    await client.query(
      "UPDATE consultations SET status = 'COMPLETED', completed_at = NOW(), updated_at = NOW() WHERE id = $1",
      [consultationId]
    );
  });

  return prescription;
};

// Get prescription by consultation ID with doctor profile details
const findPrescriptionDetails = async (consultationId) => {
  const db = getDb();
  const res = await db.query(
    `SELECT 
      p.*,
      prof.first_name as "doctorFirstName", prof.last_name as "doctorLastName",
      d.license_number as "doctorLicenseNumber"
     FROM prescriptions p
     JOIN doctors d ON p.doctor_id = d.id
     JOIN profiles prof ON d.user_id = prof.user_id
     WHERE p.consultation_id = $1`,
    [consultationId]
  );
  return res.rows[0] || null;
};

module.exports = {
  findDoctorByUserId,
  findConsultationById,
  findExistingPrescription,
  createPrescriptionTransaction,
  findPrescriptionDetails
};
