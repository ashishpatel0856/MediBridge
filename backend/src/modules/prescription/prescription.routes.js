const { Router } = require('express');
const { prescriptionController } = require('./prescription.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { requireRole, requireVerifiedDoctor } = require('../../middleware/rbac.middleware');
const { idempotencyMiddleware } = require('../../middleware/idempotency.middleware');
const { validateRequest } = require('../../middleware/validation.middleware');
const { CreatePrescriptionDto, VerifyPrescriptionDto } = require('./prescription.dto');
const { auditLog } = require('../../middleware/audit.middleware');

const router = Router();

router.post(
  '/',
  authenticate,
  requireRole('DOCTOR'),
  requireVerifiedDoctor,
  idempotencyMiddleware,
  validateRequest({ body: CreatePrescriptionDto }),
  auditLog('ISSUE_PRESCRIPTION', 'PRESCRIPTION'),
  prescriptionController.createPrescription
);

router.get(
  '/:consultationId',
  authenticate,
  auditLog('VIEW_PRESCRIPTION', 'PRESCRIPTION'),
  prescriptionController.getPrescription
);

router.post(
  '/verify',
  validateRequest({ body: VerifyPrescriptionDto }),
  prescriptionController.verifySignature
);

module.exports = router;
