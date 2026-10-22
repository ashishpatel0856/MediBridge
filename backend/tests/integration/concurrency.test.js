const request = require('supertest');
const { v4: uuidv4 } = require('uuid');
const { app } = require('../../src/app');
const { setDatabaseConnection } = require('../../src/infrastructure/database/connection');
const { MockDatabaseConnection } = require('../helpers/mock-db');
const { hashPassword } = require('../../src/infrastructure/security/crypto');
const { generateAccessToken } = require('../../src/infrastructure/security/jwt');

describe('Concurrency & Race-Condition Prevention Test Suite', () => {
  let mockDb;
  let slotId;
  let doctorId;
  const patientTokens = [];

  beforeAll(async () => {
    mockDb = new MockDatabaseConnection();
    setDatabaseConnection(mockDb);

    doctorId = uuidv4();
    mockDb.doctors.set(doctorId, {
      id: doctorId,
      userId: uuidv4(),
      licenseNumber: 'LIC-CONCURRENCY-99',
      specialties: ['Ayurveda'],
      qualifications: ['BAMS'],
      experienceYears: 10,
      consultationFee: 700,
      ratingAverage: 4.9,
      ratingCount: 15,
      languages: ['English'],
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    slotId = uuidv4();
    const futureTime = new Date();
    futureTime.setDate(futureTime.getDate() + 3);

    mockDb.slots.set(slotId, {
      id: slotId,
      doctorId,
      startTime: futureTime,
      endTime: new Date(futureTime.getTime() + 30 * 60000),
      isBooked: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const passwordHash = await hashPassword('Password@123');
    for (let i = 1; i <= 5; i++) {
      const patientId = uuidv4();
      const email = `patient.concurrent.${i}@example.com`;
      mockDb.users.set(patientId, {
        id: patientId,
        email,
        passwordHash,
        role: 'PATIENT',
        isMfaEnabled: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      patientTokens.push(
        generateAccessToken({
          userId: patientId,
          email,
          role: 'PATIENT'
        })
      );
    }
  });

  afterAll(async () => {
    await mockDb.close();
  });

  it('should prevent double booking under high concurrency (5 simultaneous requests for 1 slot)', async () => {
    const bookingPromises = patientTokens.map((token, index) =>
      request(app)
        .post('/api/v1/bookings/book')
        .set('Authorization', `Bearer ${token}`)
        .set('Idempotency-Key', `concurrent-key-${index}-${Date.now()}`)
        .send({
          slotId,
          symptoms: `Concurrent booking test from patient ${index}`,
          paymentMethod: 'UPI'
        })
    );

    const responses = await Promise.all(bookingPromises);

    const successfulBookings = responses.filter((r) => r.status === 201);
    const conflictBookings = responses.filter((r) => r.status === 409);

    expect(successfulBookings.length).toBe(1);
    expect(conflictBookings.length).toBe(4);

    const slot = mockDb.slots.get(slotId);
    expect(slot.isBooked).toBe(true);
    expect(mockDb.consultations.size).toBe(1);
    expect(mockDb.payments.size).toBe(1);
  });
});
