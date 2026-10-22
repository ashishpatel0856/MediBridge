const { Router } = require('express');
const doctorController = require('./doctor.controller');
const { validateRequest } = require('../../middleware/validation.middleware');
const { DoctorSearchDto, UpdateDoctorProfileDto } = require('./doctor.dto');
const { authenticate } = require('../../middleware/auth.middleware');
const { requireRole } = require('../../middleware/rbac.middleware');
const { auditLog } = require('../../middleware/audit.middleware');

const router = Router();

router.get(
  '/',
  validateRequest({ query: DoctorSearchDto }),
  doctorController.searchDoctors
);

router.get('/:id', doctorController.getDoctorById);

router.put(
  '/profile',
  authenticate,
  requireRole('DOCTOR'),
  validateRequest({ body: UpdateDoctorProfileDto }),
  auditLog('UPDATE_DOCTOR_PROFILE', 'DOCTOR'),
  doctorController.updateDoctorProfile
);

router.patch(
  '/:id/verify',
  authenticate,
  requireRole('ADMIN'),
  auditLog('VERIFY_DOCTOR', 'DOCTOR'),
  doctorController.verifyDoctor
);

module.exports = router;
