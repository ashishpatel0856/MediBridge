const { Router } = require('express');
const { authController } = require('./auth.controller');
const { validateRequest } = require('../../middleware/validation.middleware');
const {
  registerPatientSchema,
  registerDoctorSchema,
  loginSchema,
  verifyMfaSchema,
  refreshTokenSchema
} = require('./auth.dto');
const { authenticate } = require('../../middleware/auth.middleware');
const { authRateLimiter } = require('../../middleware/rate-limit.middleware');
const { auditLog } = require('../../middleware/audit.middleware');

const router = Router();

// Separate Patient Registration
router.post(
  '/register/patient',
  authRateLimiter,
  validateRequest({ body: registerPatientSchema }),
  auditLog('AUTH_REGISTER_PATIENT', 'USER'),
  authController.registerPatient
);

// Separate Doctor Registration
router.post(
  '/register/doctor',
  authRateLimiter,
  validateRequest({ body: registerDoctorSchema }),
  auditLog('AUTH_REGISTER_DOCTOR', 'DOCTOR'),
  authController.registerDoctor
);

// Standard Login
router.post(
  '/login',
  authRateLimiter,
  validateRequest({ body: loginSchema }),
  auditLog('AUTH_LOGIN', 'USER'),
  authController.login
);

router.post(
  '/refresh',
  validateRequest({ body: refreshTokenSchema }),
  authController.refreshToken
);

router.post(
  '/mfa/setup',
  authenticate,
  auditLog('AUTH_MFA_SETUP', 'USER'),
  authController.setupMfa
);

router.post(
  '/mfa/verify',
  authenticate,
  validateRequest({ body: verifyMfaSchema }),
  auditLog('AUTH_MFA_ENABLE', 'USER'),
  authController.verifyMfa
);

router.get('/me', authenticate, authController.getMe);

module.exports = router;
