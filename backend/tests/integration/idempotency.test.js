const request = require('supertest');
const { v4: uuidv4 } = require('uuid');
const { app } = require('../../src/app');
const { setDatabaseConnection } = require('../../src/infrastructure/database/connection');
const { MockDatabaseConnection } = require('../helpers/mock-db');
const { hashPassword } = require('../../src/infrastructure/security/crypto');
const { generateAccessToken } = require('../../src/infrastructure/security/jwt');

describe('Idempotency Critical Verification Test Suite', () => {
  let mockDb;
  let patientToken;
  let slotId;
  let doctorId;

  beforeAll(async () => {
    mockDb = new MockDatabaseConnection();
    setDatabaseConnection(mockDb);

    const patientUserId = uuidv4();
    const patientPasswordHash = await hashPassword('Password@123');
    mockDb.users.set(patientUserId, {
      id: patientUserId,
      email: 'patient.idemp@example.com',
      passwordHash: patientPasswordHash,
      role: 'PATIENT',
      isMfaEnabled: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    patientToken = generateAccessToken({
      userId: patientUserId,
      email: 'patient.idemp@example.com',
      role: 'PATIENT'
    });

    doctorId = uuidv4();
    mockDb.doctors.set(doctorId, {
      id: doctorId,
      userId: uuidv4(),
      licenseNumber: 'LIC-TEST-001',
      specialties: ['Ayurveda'],
      qualifications: ['BAMS'],
      experienceYears: 5,
      consultationFee: 500,
      ratingAverage: 5.0,
      ratingCount: 1,
      languages: ['English'],
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    slotId = uuidv4();
    const futureTime = new Date();
    futureTime.setDate(futureTime.getDate() + 2);

    mockDb.slots.set(slotId, {
      id: slotId,
      doctorId,
      startTime: futureTime,
      endTime: new Date(futureTime.getTime() + 30 * 60000),
      isBooked: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  });

  afterAll(async () => {
    await mockDb.close();
  });

  it('should guarantee write idempotency: replayed requests return identical cached response without duplicates', async () => {
    const idempotencyKey = `idemp-unique-${Date.now()}`;
    const payload = {
      slotId,
      symptoms: 'Mild migraine and fatigue',
      paymentMethod: 'UPI'
    };

    const initialRes = await request(app)
      .post('/api/v1/bookings/book')
      .set('Authorization', `Bearer ${patientToken}`)
      .set('Idempotency-Key', idempotencyKey)
      .send(payload);

    expect(initialRes.status).toBe(201);
    expect(initialRes.body.success).toBe(true);
    expect(initialRes.body.data.consultation.id).toBeDefined();
    expect(mockDb.consultations.size).toBe(1);
    expect(mockDb.payments.size).toBe(1);

    const firstConsultationId = initialRes.body.data.consultation.id;

    const replayRes = await request(app)
      .post('/api/v1/bookings/book')
      .set('Authorization', `Bearer ${patientToken}`)
      .set('Idempotency-Key', idempotencyKey)
      .send(payload);

    expect(replayRes.status).toBe(201);
    expect(replayRes.headers['x-idempotent-replay']).toBe('true');
    expect(replayRes.headers['x-cache-lookup']).toBe('HIT');
    expect(replayRes.body.data.consultation.id).toBe(firstConsultationId);

    expect(mockDb.consultations.size).toBe(1);
    expect(mockDb.payments.size).toBe(1);
  });
});
