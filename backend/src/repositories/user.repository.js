const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../infrastructure/database/connection');
const { ConflictError } = require('../domain/errors/app-errors');

// Find user by normalized email
const findUserByEmail = async (email) => {
  const db = getDb();
  const query = `
    SELECT id, email, password_hash AS "passwordHash", role,
           is_mfa_enabled AS "isMfaEnabled", mfa_secret AS "mfaSecret"
    FROM users 
    WHERE email = $1
  `;
  const result = await db.query(query, [email.toLowerCase()]);
  return result.rows[0] || null;
};

// Find user by id
const findUserById = async (userId) => {
  const db = getDb();
  const result = await db.query('SELECT id, email, role FROM users WHERE id = $1', [userId]);
  return result.rows[0] || null;
};

// Get doctor verification status by doctor user_id
const isDoctorVerified = async (userId) => {
  const db = getDb();
  const result = await db.query('SELECT is_verified FROM doctors WHERE user_id = $1', [userId]);
  if (result.rows.length === 0) return false;
  return result.rows[0].is_verified === true || result.rows[0].isVerified === true;
};

// Fetch MFA secret for user
const getMfaSecret = async (userId) => {
  const db = getDb();
  const result = await db.query('SELECT mfa_secret FROM users WHERE id = $1', [userId]);
  if (result.rows.length === 0) return null;
  return result.rows[0].mfa_secret || '';
};

// Save generated MFA secret
const saveMfaSecret = async (userId, secret) => {
  const db = getDb();
  await db.query('UPDATE users SET mfa_secret = $1 WHERE id = $2', [secret, userId]);
};

// Enable MFA on user account
const enableMfa = async (userId) => {
  const db = getDb();
  await db.query('UPDATE users SET is_mfa_enabled = true WHERE id = $1', [userId]);
};

// Create Patient with Profile in a single PostgreSQL transaction
const createPatient = async ({ email, passwordHash, firstName, lastName, phone, dateOfBirth, gender }) => {
  const db = getDb();
  const userId = uuidv4();
  const profileId = uuidv4();

  try {
    await db.withTransaction(async (client) => {
      await client.query(
        `INSERT INTO users (id, email, password_hash, role, is_mfa_enabled, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, 'PATIENT', false, true, NOW(), NOW())`,
        [userId, email.toLowerCase(), passwordHash]
      );

      await client.query(
        `INSERT INTO profiles (id, user_id, first_name, last_name, phone, date_of_birth, gender, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
        [profileId, userId, firstName, lastName, phone || null, dateOfBirth || null, gender || null]
      );
    });

    return userId;
  } catch (err) {
    // PostgreSQL error 23505 = unique_violation
    if (err.code === '23505') {
      throw new ConflictError('A user with this email address already exists');
    }
    throw err;
  }
};

// Create Doctor with Profile and unverified doctor record (is_verified = false, rating = 0.0)
const createDoctor = async (doctorData) => {
  const db = getDb();
  const userId = uuidv4();
  const profileId = uuidv4();
  const doctorId = uuidv4();

  try {
    await db.withTransaction(async (client) => {
      await client.query(
        `INSERT INTO users (id, email, password_hash, role, is_mfa_enabled, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, 'DOCTOR', false, true, NOW(), NOW())`,
        [userId, doctorData.email.toLowerCase(), doctorData.passwordHash]
      );

      await client.query(
        `INSERT INTO profiles (id, user_id, first_name, last_name, phone, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
        [profileId, userId, doctorData.firstName, doctorData.lastName, doctorData.phone || null]
      );

      await client.query(
        `INSERT INTO doctors (id, user_id, license_number, specialties, qualifications, experience_years, consultation_fee, bio, rating_average, rating_count, is_verified, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0.0, 0, false, NOW(), NOW())`,
        [
          doctorId,
          userId,
          doctorData.licenseNumber,
          doctorData.specialties,
          doctorData.qualifications,
          doctorData.experienceYears || 0,
          doctorData.consultationFee,
          doctorData.bio || ''
        ]
      );
    });

    return { userId, doctorId };
  } catch (err) {
    if (err.code === '23505') {
      throw new ConflictError('A user with this email or license number already exists');
    }
    throw err;
  }
};

module.exports = {
  findUserByEmail,
  findUserById,
  isDoctorVerified,
  getMfaSecret,
  saveMfaSecret,
  enableMfa,
  createPatient,
  createDoctor
};
