const { authenticator } = require('otplib');
const QRCode = require('qrcode');
const userRepository = require('../../repositories/user.repository');
const { hashPassword, comparePassword } = require('../../infrastructure/security/crypto');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../../infrastructure/security/jwt');
const { BadRequestError, ConflictError, UnauthorizedError, NotFoundError } = require('../../domain/errors/app-errors');

// Register a new Patient
const registerPatient = async (input) => {
  const normalizedEmail = input.email.toLowerCase();

  const existing = await userRepository.findUserByEmail(normalizedEmail);
  if (existing) {
    throw new ConflictError('A user with this email address already exists');
  }

  const hashedPassword = await hashPassword(input.password);

  const userId = await userRepository.createPatient({
    email: normalizedEmail,
    passwordHash: hashedPassword,
    firstName: input.firstName,
    lastName: input.lastName,
    phone: input.phone,
    dateOfBirth: input.dateOfBirth,
    gender: input.gender
  });

  const tokenPayload = { userId, email: normalizedEmail, role: 'PATIENT' };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  return {
    user: { id: userId, email: normalizedEmail, role: 'PATIENT' },
    accessToken,
    refreshToken
  };
};

// Register a new Doctor (starts as unverified, pending review)
const registerDoctor = async (input) => {
  const normalizedEmail = input.email.toLowerCase();

  const existing = await userRepository.findUserByEmail(normalizedEmail);
  if (existing) {
    throw new ConflictError('A user with this email address already exists');
  }

  const hashedPassword = await hashPassword(input.password);

  const { userId, doctorId } = await userRepository.createDoctor({
    email: normalizedEmail,
    passwordHash: hashedPassword,
    firstName: input.firstName,
    lastName: input.lastName,
    phone: input.phone,
    licenseNumber: input.licenseNumber,
    specialties: input.specialties,
    qualifications: input.qualifications,
    experienceYears: input.experienceYears,
    consultationFee: input.consultationFee,
    bio: input.bio
  });

  const tokenPayload = { userId, email: normalizedEmail, role: 'DOCTOR' };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  return {
    user: { id: userId, email: normalizedEmail, role: 'DOCTOR' },
    doctorId,
    isVerified: false,
    message: 'Doctor account created successfully. Account is pending verification.',
    accessToken,
    refreshToken
  };
};

// User login with optional MFA
const login = async (input) => {
  const normalizedEmail = input.email.toLowerCase();
  const user = await userRepository.findUserByEmail(normalizedEmail);

  if (!user) {
    throw new UnauthorizedError('Invalid email or password credentials');
  }

  const isValidPassword = await comparePassword(input.password, user.passwordHash);
  if (!isValidPassword) {
    throw new UnauthorizedError('Invalid email or password credentials');
  }

  if (user.isMfaEnabled) {
    if (!input.mfaCode) {
      return {
        user: { id: user.id, email: user.email, role: user.role },
        mfaRequired: true,
        tempToken: generateAccessToken({ userId: user.id, email: user.email, role: user.role })
      };
    }

    const verified = authenticator.check(input.mfaCode, user.mfaSecret || '');
    if (!verified) {
      throw new UnauthorizedError('Invalid MFA 2FA verification code');
    }
  }

  const tokenPayload = { userId: user.id, email: user.email, role: user.role };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  return {
    user: { id: user.id, email: user.email, role: user.role },
    accessToken,
    refreshToken
  };
};

// Setup MFA TOTP Secret and QR Code
const setupMfa = async (userId) => {
  const user = await userRepository.findUserById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  const secret = authenticator.generateSecret();
  const otpAuthUrl = authenticator.keyuri(user.email, 'Amrutam Telemedicine', secret);
  const qrCodeUrl = await QRCode.toDataURL(otpAuthUrl);

  await userRepository.saveMfaSecret(userId, secret);

  return { secret, qrCodeUrl };
};

// Verify code and enable MFA
const verifyAndEnableMfa = async (userId, code) => {
  const secret = await userRepository.getMfaSecret(userId);

  if (!secret) {
    throw new BadRequestError('MFA setup has not been initiated');
  }

  const isValid = authenticator.check(code, secret);
  if (!isValid) {
    throw new BadRequestError('Invalid TOTP verification code');
  }

  await userRepository.enableMfa(userId);
  return true;
};

// Rotate refresh token
const refreshToken = async (token) => {
  const payload = verifyRefreshToken(token);
  const tokenPayload = { userId: payload.userId, email: payload.email, role: payload.role };

  return {
    accessToken: generateAccessToken(tokenPayload),
    refreshToken: generateRefreshToken(tokenPayload)
  };
};

// Class wrapper for backward compatibility with existing tests
class AuthService {
  registerPatient(input) { return registerPatient(input); }
  registerDoctor(input) { return registerDoctor(input); }
  login(input) { return login(input); }
  setupMfa(userId) { return setupMfa(userId); }
  verifyAndEnableMfa(userId, code) { return verifyAndEnableMfa(userId, code); }
  refreshToken(token) { return refreshToken(token); }
}

const authService = new AuthService();

module.exports = {
  registerPatient,
  registerDoctor,
  login,
  setupMfa,
  verifyAndEnableMfa,
  refreshToken,
  authService,
  AuthService
};
