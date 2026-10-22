const { Router } = require('express');
const { slotController } = require('./slot.controller');
const { validateRequest } = require('../../middleware/validation.middleware');
const { CreateSlotsDto, QuerySlotsDto } = require('./slot.dto');
const { authenticate, optionalAuthenticate } = require('../../middleware/auth.middleware');
const { requireRole, requireVerifiedDoctor } = require('../../middleware/rbac.middleware');

const router = Router();

router.get(
  '/',
  optionalAuthenticate,
  validateRequest({ query: QuerySlotsDto }),
  slotController.getSlots
);

router.post(
  '/',
  authenticate,
  requireRole('DOCTOR', 'ADMIN'),
  requireVerifiedDoctor,
  validateRequest({ body: CreateSlotsDto }),
  slotController.createSlots
);

module.exports = router;
