const request = require('supertest');
const { v4: uuidv4 } = require('uuid');
const { app } = require('../../src/app');
const { setDatabaseConnection } = require('../../src/infrastructure/database/connection');
const { MockDatabaseConnection } = require('../helpers/mock-db');
const { generateAccessToken } = require('../../src/infrastructure/security/jwt');

describe('Amrutam Telemedicine Backend End-to-End API Suite', () => {
  let mockDb;

  let patientToken;
  let patientUserId;
  let doctorToken;
  let doctorUserId;
  let doctorRecordId;
  let adminToken;
  let createdSlotId;
  let bookedConsultationId;

  beforeAll(() => {
    mockDb = new MockDatabaseConnection();
    setDatabaseConnection(mockDb);

    // Securely seed admin user (public admin registration is strictly prohibited)
    const adminUserId = uuidv4();
    mockDb.users.set(adminUserId, {
      id: adminUserId,
      email: 'admin.super@amrutam.co.in',
      role: 'ADMIN',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    adminToken = generateAccessToken({
      userId: adminUserId,
      email: 'admin.super@amrutam.co.in',
      role: 'ADMIN'
    });
  });

  afterAll(async () => {
    await mockDb.close();
  });

  describe('1. System Observability & Health Probes', () => {
    it('GET /health - should return UP status and dependency health', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('UP');
      expect(res.body.service).toBe('amrutam-telemedicine-backend');
    });

    it('GET /health/live - should return liveness probe OK', async () => {
      const res = await request(app).get('/health/live');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ALIVE');
    });

    it('GET /metrics - should return Prometheus metrics scraper text', async () => {
      const res = await request(app).get('/metrics');
      expect(res.status).toBe(200);
      expect(res.text).toContain('http_requests_total');
      expect(res.text).toContain('http_request_duration_seconds');
    });
  });

  describe('2. User Lifecycle & Authentication', () => {
    it('POST /api/v1/auth/register/patient - should register a new Patient', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register/patient')
        .send({
          email: 'patient.kavya@example.com',
          password: 'Password@2026',
          firstName: 'Kavya',
          lastName: 'Patel',
          phone: '+919876500001'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('PATIENT');
      expect(res.body.data.accessToken).toBeDefined();

      patientToken = res.body.data.accessToken;
      patientUserId = res.body.data.user.id;
    });

    it('POST /api/v1/auth/register/doctor - should register an Ayurvedic Doctor as pending verification', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register/doctor')
        .send({
          email: 'dr.sharma.ayurveda@amrutam.co.in',
          password: 'Password@2026',
          firstName: 'Dr. Rajesh',
          lastName: 'Sharma',
          phone: '+919876500002',
          licenseNumber: 'AYU-DEL-2016-9912',
          specialties: ['Ayurveda', 'Digestive Health', 'Panchakarma'],
          qualifications: ['BAMS', 'MD (Kayachikitsa)'],
          experienceYears: 10,
          consultationFee: 650.0,
          bio: 'Specialist in chronic gut health and metabolic disorders.'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('DOCTOR');
      expect(res.body.data.isVerified).toBe(false);

      doctorToken = res.body.data.accessToken;
      doctorUserId = res.body.data.user.id;
      doctorRecordId = res.body.data.doctorId;
      expect(doctorRecordId).toBeDefined();
    });

    it('Public ADMIN registration must be prohibited', async () => {
      // 1. Generic register endpoint must not exist
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'admin.super@amrutam.co.in',
          password: 'Password@2026',
          role: 'ADMIN'
        });
      expect(res.status).toBe(404);

      // 2. Role parameter in patient registration must be ignored (assigned PATIENT securely)
      const patientRes = await request(app)
        .post('/api/v1/auth/register/patient')
        .send({
          email: 'fake.admin@amrutam.co.in',
          password: 'Password@2026',
          role: 'ADMIN',
          firstName: 'Fake',
          lastName: 'Admin'
        });
      expect(patientRes.status).toBe(201);
      expect(patientRes.body.data.user.role).toBe('PATIENT');
    });

    it('POST /api/v1/auth/login - should authenticate with email & password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'patient.kavya@example.com',
          password: 'Password@2026'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
    });
  });

  describe('3. Doctor Verification & Search', () => {
    it('POST /api/v1/slots - should reject unverified doctor attempting to publish availability', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(14, 0, 0, 0);

      const slotEnd = new Date(tomorrow);
      slotEnd.setMinutes(slotEnd.getMinutes() + 30);

      const res = await request(app)
        .post('/api/v1/slots')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          slots: [
            {
              startTime: tomorrow.toISOString(),
              endTime: slotEnd.toISOString()
            }
          ]
        });

      expect(res.status).toBe(403);
      expect(res.body.error.message).toContain('Doctor profile is pending verification');
    });

    it('PATCH /api/v1/doctors/:id/verify - patient should not be able to verify doctors', async () => {
      const res = await request(app)
        .patch(`/api/v1/doctors/${doctorRecordId}/verify`)
        .set('Authorization', `Bearer ${patientToken}`);

      expect(res.status).toBe(403);
    });

    it('PATCH /api/v1/doctors/:id/verify - should return 404 for non-existent doctor', async () => {
      const res = await request(app)
        .patch('/api/v1/doctors/non-existent-id/verify')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });

    it('PATCH /api/v1/doctors/:id/verify - admin should verify a doctor', async () => {
      const res = await request(app)
        .patch(`/api/v1/doctors/${doctorRecordId}/verify`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Doctor verified successfully');
      expect(res.body.data.isVerified).toBe(true);
    });

    it('PATCH /api/v1/doctors/:id/verify - should return 409 for already verified doctor', async () => {
      const res = await request(app)
        .patch(`/api/v1/doctors/${doctorRecordId}/verify`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(409);
    });

    it('GET /api/v1/doctors - should search and filter verified doctors', async () => {
      const res = await request(app)
        .get('/api/v1/doctors')
        .query({ specialty: 'Ayurveda', limit: 10 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.pagination.total).toBeGreaterThan(0);
    });

    it('GET /api/v1/doctors/:id - should retrieve individual doctor profile', async () => {
      const res = await request(app).get(`/api/v1/doctors/${doctorRecordId}`);
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(doctorRecordId);
      expect(res.body.data.consultationFee).toBe(650.0);
    });
  });

  describe('4. Availability Slot Management', () => {
    it('POST /api/v1/slots - verified doctor should create availability slots', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(14, 0, 0, 0);

      const slotEnd = new Date(tomorrow);
      slotEnd.setMinutes(slotEnd.getMinutes() + 30);

      const res = await request(app)
        .post('/api/v1/slots')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          slots: [
            {
              startTime: tomorrow.toISOString(),
              endTime: slotEnd.toISOString()
            }
          ]
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.count).toBe(1);

      createdSlotId = res.body.data.slots[0].id;
    });

    it('GET /api/v1/slots - should query available slots for the doctor', async () => {
      const res = await request(app)
        .get('/api/v1/slots')
        .query({ doctorId: doctorRecordId, availableOnly: true });

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].id).toBe(createdSlotId);
    });
  });

  describe('5. Concurrency-Safe Consultation Booking & Sagas', () => {
    it('POST /api/v1/bookings/book - patient should book slot with idempotency header', async () => {
      const idempotencyKey = `idemp-key-test-${Date.now()}`;
      const res = await request(app)
        .post('/api/v1/bookings/book')
        .set('Authorization', `Bearer ${patientToken}`)
        .set('Idempotency-Key', idempotencyKey)
        .send({
          slotId: createdSlotId,
          symptoms: 'Recurring hyperacidity and sleep disruption',
          notes: 'Prefers classical formulations',
          paymentMethod: 'UPI'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.consultation.status).toBe('SCHEDULED');
      expect(res.body.data.consultation.meetingLink).toBeDefined();
      expect(res.body.data.payment.status).toBe('COMPLETED');

      bookedConsultationId = res.body.data.consultation.id;
    });

    it('PATCH /api/v1/bookings/:id/status - should transition status to IN_PROGRESS', async () => {
      const res = await request(app)
        .patch(`/api/v1/bookings/${bookedConsultationId}/status`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({ status: 'IN_PROGRESS' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('IN_PROGRESS');
      expect(res.body.data.startedAt).toBeDefined();
    });
  });

  describe('6. Cryptographically Signed Digital Prescriptions', () => {
    it('POST /api/v1/prescriptions - doctor should issue tamper-evident prescription', async () => {
      const res = await request(app)
        .post('/api/v1/prescriptions')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          consultationId: bookedConsultationId,
          diagnosis: 'Amlapitta with secondary insomnia',
          medications: [
            {
              medicineName: 'Amrutam Gold Malt',
              dosage: '10g (1 tablespoon)',
              frequency: 'Twice daily with lukewarm milk',
              duration: '30 days',
              instructions: 'Take after meals'
            },
            {
              medicineName: 'Amrutam Brakey Herbs Churna',
              dosage: '3g',
              frequency: 'Once before sleep',
              duration: '15 days'
            }
          ],
          instructions: 'Practice mild yoga and avoid pungent spices and late night screen time.',
          followUpDate: '2026-11-20'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.digitalSignature).toBeDefined();
      expect(res.body.data.digitalSignature.length).toBe(64);
    });

    it('GET /api/v1/prescriptions/:consultationId - patient can view their prescription', async () => {
      const res = await request(app)
        .get(`/api/v1/prescriptions/${bookedConsultationId}`)
        .set('Authorization', `Bearer ${patientToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.diagnosis).toBe('Amlapitta with secondary insomnia');
      expect(res.body.data.digitalSignature).toBeDefined();
    });
  });

  describe('7. Admin Analytics & Compliance Audit Trail', () => {
    it('GET /api/v1/analytics/overview - admin can retrieve platform KPIs', async () => {
      const res = await request(app)
        .get('/api/v1/analytics/overview')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.consultations.total).toBeGreaterThan(0);
      expect(res.body.data.revenue.totalGross).toBeGreaterThan(0);
      expect(res.body.data.capacityAndUtilization.scaleTargetDailyConsultations).toBe(100000);
    });

    it('GET /api/v1/audit - admin can query compliance audit logs', async () => {
      const res = await request(app)
        .get('/api/v1/audit')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });
});
