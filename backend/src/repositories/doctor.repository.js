const { getDb } = require('../infrastructure/database/connection');

// Doctor profile by ID (with user name from profiles)
const findById = async (doctorId) => {
  const db = getDb();
  const query = `
    SELECT 
      d.id, d.user_id as "userId", d.license_number as "licenseNumber",
      d.specialties, d.qualifications, d.experience_years as "experienceYears",
      d.consultation_fee as "consultationFee", d.bio, d.rating_average as "ratingAverage",
      d.rating_count as "ratingCount", d.languages,
      p.first_name as "firstName", p.last_name as "lastName"
    FROM doctors d
    JOIN profiles p ON d.user_id = p.user_id
    WHERE d.id = $1
  `;

  const result = await db.query(query, [doctorId]);
  return result.rows[0] || null;
};

// Doctor by User ID (used when a logged-in doctor updates their profile)
const findByUserId = async (userId) => {
  const db = getDb();
  const result = await db.query('SELECT * FROM doctors WHERE user_id = $1', [userId]);
  return result.rows[0] || null;
};

// Search & filter doctors with pagination
const searchDoctors = async (filters) => {
  const db = getDb();
  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const offset = (page - 1) * limit;

  const conditions = [];
  const params = [];
  let paramIndex = 1;

  if (filters.isVerified !== undefined) {
    conditions.push(`d.is_verified = $${paramIndex++}`);
    params.push(filters.isVerified);
  } else {
    conditions.push('d.is_verified = true');
  }

  if (filters.specialty) {
    conditions.push(`$${paramIndex++} = ANY(d.specialties)`);
    params.push(filters.specialty);
  }
  if (filters.minExperience) {
    conditions.push(`d.experience_years >= $${paramIndex++}`);
    params.push(filters.minExperience);
  }
  if (filters.maxFee) {
    conditions.push(`d.consultation_fee <= $${paramIndex++}`);
    params.push(filters.maxFee);
  }
  if (filters.minRating) {
    conditions.push(`d.rating_average >= $${paramIndex++}`);
    params.push(filters.minRating);
  }
  if (filters.query) {
    conditions.push(`(p.first_name ILIKE $${paramIndex} OR p.last_name ILIKE $${paramIndex} OR d.bio ILIKE $${paramIndex})`);
    params.push(`%${filters.query}%`);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await db.query(
    `SELECT COUNT(*) as total FROM doctors d JOIN profiles p ON d.user_id = p.user_id ${whereClause}`,
    params
  );
  const total = parseInt(countResult.rows[0]?.total || 0, 10);

  const dataParams = [...params, limit, offset];
  const dataResult = await db.query(
    `SELECT 
      d.id, d.user_id as "userId", d.license_number as "licenseNumber",
      d.specialties, d.qualifications, d.experience_years as "experienceYears",
      d.consultation_fee as "consultationFee", d.bio, d.rating_average as "ratingAverage",
      d.rating_count as "ratingCount", d.languages, d.is_verified as "isVerified",
      p.first_name as "firstName", p.last_name as "lastName"
    FROM doctors d
    JOIN profiles p ON d.user_id = p.user_id
    ${whereClause}
    ORDER BY d.rating_average DESC, d.experience_years DESC
    LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
    dataParams
  );

  return { doctors: dataResult.rows, total };
};

// Update doctor profile fields
const updateProfile = async (userId, data) => {
  const db = getDb();
  const updates = ['updated_at = NOW()'];
  const params = [];
  let idx = 1;

  if (data.specialties) {
    updates.push(`specialties = $${idx++}`);
    params.push(data.specialties);
  }
  if (data.qualifications) {
    updates.push(`qualifications = $${idx++}`);
    params.push(data.qualifications);
  }
  if (data.experienceYears !== undefined) {
    updates.push(`experience_years = $${idx++}`);
    params.push(data.experienceYears);
  }
  if (data.consultationFee !== undefined) {
    updates.push(`consultation_fee = $${idx++}`);
    params.push(data.consultationFee);
  }
  if (data.bio !== undefined) {
    updates.push(`bio = $${idx++}`);
    params.push(data.bio);
  }
  if (data.languages) {
    updates.push(`languages = $${idx++}`);
    params.push(data.languages);
  }

  params.push(userId);
  const result = await db.query(
    `UPDATE doctors SET ${updates.join(', ')} WHERE user_id = $${idx} RETURNING *`,
    params
  );

  return result.rows[0] || null;
};

// Get verification status by doctor ID (not user_id)
const findVerificationStatus = async (doctorId) => {
  const db = getDb();
  const result = await db.query(
    'SELECT id, user_id AS "userId", is_verified AS "isVerified" FROM doctors WHERE id = $1',
    [doctorId]
  );
  return result.rows[0] || null;
};

// Admin verifies a doctor — sets is_verified = true
const verifyDoctor = async (doctorId) => {
  const db = getDb();
  const result = await db.query(
    `UPDATE doctors SET is_verified = true, updated_at = NOW()
     WHERE id = $1
     RETURNING id, user_id AS "userId", is_verified AS "isVerified"`,
    [doctorId]
  );
  return result.rows[0] || null;
};

module.exports = {
  findById,
  findByUserId,
  searchDoctors,
  updateProfile,
  findVerificationStatus,
  verifyDoctor
};
