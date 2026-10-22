const { v4: uuidv4 } = require('uuid');
const { db } = require('./connection');
const { hashPassword } = require('../security/crypto');
const { logger } = require('../logger');
const { syncAdmin } = require('./sync-admin');

async function seedDatabase() {
  logger.info('Seeding database with initial doctors, users, and availability slots...');

  const defaultPassword = await hashPassword('Amrutam@2026Safe');

  // Seed / Synchronize Admin from environment configuration
  try {
    await syncAdmin();
  } catch (err) {
    logger.warn({ err: err.message }, 'Admin sync skipped, using fallback seed admin');
    const adminId = uuidv4();
    await db.query(
      `INSERT INTO users (id, email, password_hash, role, is_active, created_at, updated_at)
       VALUES ($1, 'admin@amrutam.co.in', $2, 'ADMIN', true, NOW(), NOW())
       ON CONFLICT (email) DO NOTHING`,
      [adminId, defaultPassword]
    );
  }

  // Seed Ayurvedic Doctors
  const doctorsData = [
    {
      email: 'dr.priya.nair@amrutam.co.in',
      firstName: 'Dr. Priya',
      lastName: 'Nair',
      licenseNumber: 'AYU-KER-2015-8891',
      specialties: ['Ayurveda', 'Panchakarma', 'Skin & Hair'],
      qualifications: ['BAMS (Kerala Ayurveda University)', 'MD (Panchakarma)'],
      experienceYears: 12,
      consultationFee: 750.0,
      bio: 'Senior Ayurvedic Physician specializing in Panchakarma detoxification and chronic skin disorders with 12+ years of clinical practice.',
      ratingAverage: 4.95,
      ratingCount: 184
    },
    {
      email: 'dr.rohit.joshi@amrutam.co.in',
      firstName: 'Dr. Rohit',
      lastName: 'Joshi',
      licenseNumber: 'AYU-MAH-2018-4521',
      specialties: ['Ayurveda', 'Digestive Health', 'Lifestyle Disorders'],
      qualifications: ['BAMS (Pune)', 'Diploma in Ayurvedic Nutrition'],
      experienceYears: 8,
      consultationFee: 500.0,
      bio: 'Holistic Ayurvedic practitioner focused on gut microbiome balance, IBS, and metabolic harmony through personalized dinacharya regimens.',
      ratingAverage: 4.85,
      ratingCount: 96
    },
    {
      email: 'dr.ananya.sen@amrutam.co.in',
      firstName: 'Dr. Ananya',
      lastName: 'Sen',
      licenseNumber: 'AYU-WB-2012-1092',
      specialties: ['Ayurveda', 'Arthritis & Joint Care', 'Stress Management'],
      qualifications: ['BAMS (Kolkata)', 'PhD (Ayurvedic Herbology)'],
      experienceYears: 14,
      consultationFee: 900.0,
      bio: 'Herbal medicine expert treating musculoskeletal arthritis, sciatica, and stress-related neuro-endocrine imbalances.',
      ratingAverage: 4.98,
      ratingCount: 312
    }
  ];

  for (const doc of doctorsData) {
    const userId = uuidv4();
    const userRes = await db.query(
      `INSERT INTO users (id, email, password_hash, role, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, 'DOCTOR', true, NOW(), NOW())
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
      [userId, doc.email, defaultPassword]
    );

    const actualUserId = userRes.rows.length > 0 ? userRes.rows[0].id : null;
    if (actualUserId) {
      // Profile
      await db.query(
        `INSERT INTO profiles (id, user_id, first_name, last_name, phone, created_at, updated_at)
         VALUES ($1, $2, $3, $4, '+919876543210', NOW(), NOW())`,
        [uuidv4(), actualUserId, doc.firstName, doc.lastName]
      );

      // Doctor Record
      const doctorId = uuidv4();
      await db.query(
        `INSERT INTO doctors (id, user_id, license_number, specialties, qualifications, experience_years, consultation_fee, bio, rating_average, rating_count, languages, is_verified, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, ARRAY['English', 'Hindi', 'Malayalam'], true, NOW(), NOW())`,
        [
          doctorId,
          actualUserId,
          doc.licenseNumber,
          doc.specialties,
          doc.qualifications,
          doc.experienceYears,
          doc.consultationFee,
          doc.bio,
          doc.ratingAverage,
          doc.ratingCount
        ]
      );

      // Create 3 Availability Slots for tomorrow
      for (let hour = 10; hour <= 12; hour++) {
        const slotStart = new Date();
        slotStart.setDate(slotStart.getDate() + 1);
        slotStart.setHours(hour, 0, 0, 0);

        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotStart.getMinutes() + 30);

        await db.query(
          `INSERT INTO availability_slots (id, doctor_id, start_time, end_time, is_booked, created_at, updated_at)
           VALUES ($1, $2, $3, $4, false, NOW(), NOW())
           ON CONFLICT DO NOTHING`,
          [uuidv4(), doctorId, slotStart, slotEnd]
        );
      }
    }
  }

  // Seed Test Patient
  const patientId = uuidv4();
  const patRes = await db.query(
    `INSERT INTO users (id, email, password_hash, role, is_active, created_at, updated_at)
     VALUES ($1, 'patient.aarav@example.com', $2, 'PATIENT', true, NOW(), NOW())
     ON CONFLICT (email) DO NOTHING
     RETURNING id`,
    [patientId, defaultPassword]
  );
  if (patRes.rows.length > 0) {
    await db.query(
      `INSERT INTO profiles (id, user_id, first_name, last_name, phone, created_at, updated_at)
       VALUES ($1, $2, 'Aarav', 'Sharma', '+919988776655', NOW(), NOW())`,
      [uuidv4(), patientId]
    );
  }

  logger.info('Database seeded successfully with default accounts and Ayurvedic doctors.');
}

if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { seedDatabase };
