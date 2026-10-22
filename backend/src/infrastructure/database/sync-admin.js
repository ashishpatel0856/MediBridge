const { v4: uuidv4 } = require('uuid');
const { config } = require('../../config/env');
const { getDb } = require('./connection');
const { hashPassword } = require('../security/crypto');
const { logger } = require('../logger');

/**
 * Idempotent Admin synchronization script.
 * Safely updates or creates the single designated administrator account
 * based on ADMIN_EMAIL and ADMIN_PASSWORD from environment variables.
 * Never prints password in logs.
 */
async function syncAdmin() {
  if (!config.admin.email || !config.admin.password) {
    const errorMsg = 'SETUP ERROR: Missing required environment variables. ADMIN_EMAIL and ADMIN_PASSWORD must be defined in .env.';
    logger.error(errorMsg);
    throw new Error(errorMsg);
  }

  const email = config.admin.email.trim().toLowerCase();
  const rawPassword = config.admin.password;

  if (rawPassword.length < 8) {
    const errorMsg = 'SETUP ERROR: ADMIN_PASSWORD must be at least 8 characters long.';
    logger.error(errorMsg);
    throw new Error(errorMsg);
  }

  logger.info({ email }, 'Initiating admin account synchronization...');

  const hashedPassword = await hashPassword(rawPassword);
  const db = getDb();

  let adminUserId = null;

  await db.withTransaction(async (client) => {
    // 1. Check if user with target email already exists
    const emailRes = await client.query(
      'SELECT id, role FROM users WHERE email = $1 FOR UPDATE',
      [email]
    );

    if (emailRes.rows.length > 0) {
      adminUserId = emailRes.rows[0].id;
      await client.query(
        `UPDATE users
         SET password_hash = $1, role = 'ADMIN', is_active = true, updated_at = NOW()
         WHERE id = $2`,
        [hashedPassword, adminUserId]
      );
    } else {
      // 2. Check if an existing ADMIN user exists under an old email
      const existingAdminRes = await client.query(
        "SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1 FOR UPDATE"
      );

      if (existingAdminRes.rows.length > 0) {
        adminUserId = existingAdminRes.rows[0].id;
        await client.query(
          `UPDATE users
           SET email = $1, password_hash = $2, is_active = true, updated_at = NOW()
           WHERE id = $3`,
          [email, hashedPassword, adminUserId]
        );
      } else {
        // 3. No admin exists at all; create brand new admin
        adminUserId = uuidv4();
        await client.query(
          `INSERT INTO users (id, email, password_hash, role, is_active, created_at, updated_at)
           VALUES ($1, $2, $3, 'ADMIN', true, NOW(), NOW())`,
          [adminUserId, email, hashedPassword]
        );
      }
    }

    // 4. Ensure admin has a corresponding profile record
    const profileRes = await client.query(
      'SELECT id FROM profiles WHERE user_id = $1',
      [adminUserId]
    );

    if (profileRes.rows.length === 0) {
      await client.query(
        `INSERT INTO profiles (id, user_id, first_name, last_name, phone, created_at, updated_at)
         VALUES ($1, $2, 'Ashish', 'Admin', '+919999999999', NOW(), NOW())`,
        [uuidv4(), adminUserId]
      );
    } else {
      await client.query(
        `UPDATE profiles
         SET first_name = 'Ashish', last_name = 'Admin', updated_at = NOW()
         WHERE user_id = $1`,
        [adminUserId]
      );
    }
  });

  logger.info({ email, role: 'ADMIN' }, 'Admin account successfully synchronized in database');
  return { success: true, email };
}

if (require.main === module) {
  syncAdmin()
    .then(() => {
      console.log('Admin account synchronized successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Admin sync failed:', err.message);
      process.exit(1);
    });
}

module.exports = { syncAdmin };
