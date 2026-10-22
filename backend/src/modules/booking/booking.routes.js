const { Router } = require('express');
const { bookingController } = require('./booking.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { requireRole } = require('../../middleware/rbac.middleware');
const { idempotencyMiddleware } = require('../../middleware/idempotency.middleware');
const { validateRequest } = require('../../middleware/validation.middleware');
const { BookConsultationDto, ConfirmPaymentDto, UpdateConsultationStatusDto, QueryConsultationsDto } = require('./booking.dto');
const { auditLog } = require('../../middleware/audit.middleware');

const router = Router();

router.use(authenticate);

router.post(
  '/book',
  requireRole('PATIENT'),
  idempotencyMiddleware,
  validateRequest({ body: BookConsultationDto }),
  auditLog('BOOK_CONSULTATION', 'CONSULTATION'),
  bookingController.bookConsultation
);

router.post(
  '/confirm-payment',
  requireRole('PATIENT'),
  validateRequest({ body: ConfirmPaymentDto }),
  auditLog('CONFIRM_PAYMENT', 'PAYMENT'),
  bookingController.confirmPayment
);

router.patch(
  '/:id/status',
  idempotencyMiddleware,
  validateRequest({ body: UpdateConsultationStatusDto }),
  auditLog('UPDATE_CONSULTATION_STATUS', 'CONSULTATION'),
  bookingController.updateConsultationStatus
);

router.get(
  '/',
  validateRequest({ query: QueryConsultationsDto }),
  bookingController.getConsultations
);

router.get('/:id', bookingController.getConsultationById);

module.exports = router;
