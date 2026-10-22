const { z } = require('zod');

const BookConsultationDto = z.object({
  slotId: z.string().uuid('Valid slot ID required'),
  symptoms: z.string().min(3, 'Please describe your symptoms').max(1000),
  notes: z.string().max(1000).optional(),
});

const ConfirmPaymentDto = z.object({
  paymentIntentId: z.string().min(1, 'Payment intent ID is required'),
});

const UpdateConsultationStatusDto = z.object({
  status: z.enum(['IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW']),
  cancellationReason: z.string().optional()
});

const QueryConsultationsDto = z.object({
  status: z.enum(['PENDING_PAYMENT', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10)
});

module.exports = {
  BookConsultationDto,
  ConfirmPaymentDto,
  UpdateConsultationStatusDto,
  QueryConsultationsDto
};
