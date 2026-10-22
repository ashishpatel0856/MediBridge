const { z } = require('zod');

// Password rule: Min 8 chars, 1 uppercase, 1 number, 1 special character
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

// Patient Registration: only patient profile fields (no role field in body)
const registerPatientSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: passwordSchema,
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional()
});

// Doctor Registration: professional credentials required (no role field in body)
const registerDoctorSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: passwordSchema,
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  licenseNumber: z.string().min(1, 'Medical license number is required'),
  specialties: z.array(z.string()).min(1, 'At least one specialty is required'),
  qualifications: z.array(z.string()).min(1, 'At least one qualification is required'),
  experienceYears: z.number().min(0).default(0),
  consultationFee: z.number().min(0, 'Consultation fee must be non-negative'),
  bio: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  mfaCode: z.string().length(6, 'MFA code must be exactly 6 digits').optional()
});

const verifyMfaSchema = z.object({
  code: z.string().length(6, 'TOTP code must be 6 digits')
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
});

module.exports = {
  registerPatientSchema,
  registerDoctorSchema,
  loginSchema,
  verifyMfaSchema,
  refreshTokenSchema
};
