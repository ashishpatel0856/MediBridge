const { AuthService } = require('../../src/modules/auth/auth.service');
const { MockDatabaseConnection } = require('../helpers/mock-db');
const { setDatabaseConnection } = require('../../src/infrastructure/database/connection');
const { authenticator } = require('otplib');

describe('AuthService Unit Tests', () => {
  let authService;
  let mockDb;

  beforeEach(() => {
    mockDb = new MockDatabaseConnection();
    setDatabaseConnection(mockDb);
    authService = new AuthService();
  });

  afterEach(async () => {
    await mockDb.close();
  });

  it('should register a new patient successfully', async () => {
    const result = await authService.registerPatient({
      email: 'test.patient@example.com',
      password: 'Password@123',
      firstName: 'Rohan',
      lastName: 'Mehta'
    });

    expect(result.user).toBeDefined();
    expect(result.user.email).toBe('test.patient@example.com');
    expect(result.user.role).toBe('PATIENT');
    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
  });

  it('should register a new doctor with isVerified = false (pending)', async () => {
    const result = await authService.registerDoctor({
      email: 'dr.sharma@example.com',
      password: 'Password@123',
      firstName: 'Dr. Rajesh',
      lastName: 'Sharma',
      licenseNumber: 'LIC-12345',
      specialties: ['Ayurveda'],
      qualifications: ['BAMS'],
      consultationFee: 500
    });

    expect(result.user).toBeDefined();
    expect(result.user.email).toBe('dr.sharma@example.com');
    expect(result.user.role).toBe('DOCTOR');
    expect(result.isVerified).toBe(false);
    expect(result.accessToken).toBeDefined();
  });

  it('should throw ConflictError if email is already taken', async () => {
    await authService.registerPatient({
      email: 'duplicate@example.com',
      password: 'Password@123',
      firstName: 'First',
      lastName: 'User'
    });

    await expect(
      authService.registerPatient({
        email: 'duplicate@example.com',
        password: 'Password@123',
        firstName: 'Second',
        lastName: 'User'
      })
    ).rejects.toThrow('A user with this email address already exists');
  });

  it('should authenticate user with valid credentials', async () => {
    await authService.registerPatient({
      email: 'login.test@example.com',
      password: 'Password@123',
      firstName: 'Login',
      lastName: 'Tester'
    });

    const loginRes = await authService.login({
      email: 'login.test@example.com',
      password: 'Password@123'
    });

    expect(loginRes.accessToken).toBeDefined();
    expect(loginRes.user.email).toBe('login.test@example.com');
  });

  it('should reject invalid password', async () => {
    await authService.registerPatient({
      email: 'wrongpass@example.com',
      password: 'Password@123',
      firstName: 'Bad',
      lastName: 'Pass'
    });

    await expect(
      authService.login({
        email: 'wrongpass@example.com',
        password: 'IncorrectPassword'
      })
    ).rejects.toThrow('Invalid email or password credentials');
  });

  it('should setup and verify MFA TOTP', async () => {
    const reg = await authService.registerPatient({
      email: 'mfa.user@example.com',
      password: 'Password@123',
      firstName: 'Mfa',
      lastName: 'User'
    });

    const mfaSetup = await authService.setupMfa(reg.user.id);
    expect(mfaSetup.secret).toBeDefined();
    expect(mfaSetup.qrCodeUrl).toBeDefined();

    const token = authenticator.generate(mfaSetup.secret);
    const verified = await authService.verifyAndEnableMfa(reg.user.id, token);
    expect(verified).toBe(true);
  });
});
