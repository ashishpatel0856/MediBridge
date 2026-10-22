const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../infrastructure/database/connection');

// Bulk insert availability slots for a doctor
const createSlots = async (doctorId, slots) => {
  const db = getDb();
  const created = [];

  for (const slot of slots) {
    const slotId = uuidv4();
    const start = new Date(slot.startTime);
    const end = new Date(slot.endTime);

    await db.query(
      `INSERT INTO availability_slots (id, doctor_id, start_time, end_time, is_booked, created_at, updated_at)
       VALUES ($1, $2, $3, $4, false, NOW(), NOW())
       ON CONFLICT (doctor_id, start_time) DO NOTHING`,
      [slotId, doctorId, start, end]
    );

    created.push({ id: slotId, doctorId, startTime: start, endTime: end, isBooked: false });
  }

  return created;
};

// Query available slots for a doctor with date range filters
const findSlots = async ({ doctorId, availableOnly, startDate, endDate }) => {
  const db = getDb();
  const conditions = ['doctor_id = $1'];
  const params = [doctorId];
  let idx = 2;

  if (availableOnly) {
    conditions.push('is_booked = false');
    conditions.push('start_time > NOW()');
  }

  if (startDate) {
    conditions.push(`start_time >= $${idx++}`);
    params.push(new Date(startDate));
  }

  if (endDate) {
    conditions.push(`end_time <= $${idx++}`);
    params.push(new Date(endDate));
  }

  const res = await db.query(
    `SELECT id, doctor_id as "doctorId", start_time as "startTime", end_time as "endTime", is_booked as "isBooked"
     FROM availability_slots
     WHERE ${conditions.join(' AND ')}
     ORDER BY start_time ASC`,
    params
  );

  return res.rows;
};

module.exports = {
  createSlots,
  findSlots
};
