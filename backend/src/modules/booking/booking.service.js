const { v4: uuidv4 } = require('uuid');
const bookingRepository = require('../../repositories/booking.repository');
const { getStripe } = require('../../infrastructure/payment/stripe');
const { config } = require('../../config/env');
const { jobQueue } = require('../../infrastructure/queue/job-queue');
const { bookingConflictsCounter, activeConsultationsGauge } = require('../../infrastructure/metrics/prometheus');
const { ForbiddenError, NotFoundError, BadRequestError } = require('../../domain/errors/app-errors');
const { getDb } = require('../../infrastructure/database/connection');

// Book a consultation slot with pure PostgreSQL atomic transactions & SELECT ... FOR UPDATE
const bookConsultation = async (patientId, input) => {
  try {
    const isStripe = input.paymentMethod === 'STRIPE';
    const consultationId = uuidv4();
    const paymentId = uuidv4();

    let clientSecret = null;
    let paymentIntentId = null;

    if (isStripe && config.stripe.secretKey) {
      try {
        const stripe = getStripe();
        const db = getDb();
        const slotRes = await db.query('SELECT doctor_id FROM availability_slots WHERE id = $1', [input.slotId]);
        if (slotRes.rows.length === 0) throw new NotFoundError('Slot not found');

        const doctorId = slotRes.rows[0].doctor_id;
        const docRes = await db.query('SELECT consultation_fee FROM doctors WHERE id = $1', [doctorId]);
        const consultationFee = docRes.rows.length > 0 ? parseFloat(docRes.rows[0].consultation_fee) : 500.0;

        const amountInPaise = Math.round(consultationFee * 100);
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amountInPaise,
          currency: config.stripe.currency,
          metadata: { consultationId, patientId, doctorId, slotId: input.slotId },
          automatic_payment_methods: { enabled: true },
        });

        clientSecret = paymentIntent.client_secret;
        paymentIntentId = paymentIntent.id;
      } catch (stripeErr) {
        // Fallback gracefully if Stripe test keys encounter issue
        console.warn('Stripe intent creation warning, falling back to instant booking:', stripeErr.message);
      }
    }

    const isPending = isStripe && !!clientSecret;

    const { consultation, payment } = await bookingRepository.bookSlotTransaction({
      slotId: input.slotId,
      patientId,
      paymentMethod: input.paymentMethod || 'UPI',
      symptoms: input.symptoms,
      notes: input.notes,
      isPendingPayment: isPending,
      stripePaymentIntentId: paymentIntentId,
      consultationId,
      paymentId,
    });

    // If payment is completed immediately (standard non-Stripe flow or instant confirmation), enqueue email
    if (consultation.status === 'SCHEDULED') {
      await jobQueue.add('send_appointment_confirmation', {
        consultationId: consultation.id,
        patientEmail: `patient-${patientId.slice(0, 6)}@amrutam.co.in`,
        meetingLink: consultation.meeting_link,
      });
    }

    return {
      consultation,
      payment,
      clientSecret,
      paymentIntentId,
    };
  } catch (error) {
    if (error.name === 'ConflictError' || error.statusCode === 409) {
      bookingConflictsCounter.inc();
    }
    throw error;
  }
};

// Confirm payment — called when Stripe payment succeeds on the frontend
const confirmPayment = async (patientId, paymentIntentId) => {
  const stripe = getStripe();

  // Verify status with Stripe
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (paymentIntent.status !== 'succeeded') {
    throw new BadRequestError(`Payment not completed. Status: ${paymentIntent.status}`);
  }

  const { consultation, payment } = await bookingRepository.confirmPaymentTransaction(paymentIntentId, patientId);

  // Enqueue appointment confirmation email asynchronously
  await jobQueue.add('send_appointment_confirmation', {
    consultationId: consultation.id,
    patientEmail: `patient-${patientId.slice(0, 6)}@amrutam.co.in`,
    meetingLink: consultation.meeting_link,
  });

  return { consultation, payment };
};

// Update consultation status with access control & status transitions
const updateConsultationStatus = async (consultationId, userId, userRole, input) => {
  const consultation = await bookingRepository.findConsultationById(consultationId);

  if (!consultation) {
    throw new NotFoundError('Consultation not found');
  }

  const isPatient = userRole === 'PATIENT';
  const isAdmin = userRole === 'ADMIN';

  if (!isAdmin && isPatient) {
    const ownerId = consultation.patient_id || consultation.patientId;
    if (ownerId !== userId) {
      throw new ForbiddenError('You can only manage your own consultations');
    }
  }

  const currentStatus = consultation.status;
  const targetStatus = input.status;

  if (currentStatus === 'COMPLETED' || currentStatus === 'CANCELLED') {
    throw new BadRequestError(`Cannot transition consultation from terminal state '${currentStatus}'`);
  }

  if (targetStatus === 'IN_PROGRESS') {
    activeConsultationsGauge.inc();
  } else if (currentStatus === 'IN_PROGRESS' && (targetStatus === 'COMPLETED' || targetStatus === 'CANCELLED')) {
    activeConsultationsGauge.dec();
  }

  const updated = await bookingRepository.updateConsultationStatus(consultationId, targetStatus);
  return updated;
};

// List consultations
const getConsultations = async (userId, role, query) => {
  return bookingRepository.listConsultations({ userId, role, query });
};

// Get single consultation by ID with authorization check
const getConsultationById = async (consultationId, userId, role) => {
  const consultation = await bookingRepository.findConsultationById(consultationId);

  if (!consultation) {
    throw new NotFoundError('Consultation not found');
  }

  const isPatient = role === 'PATIENT';

  if (isPatient) {
    const ownerId = consultation.patient_id || consultation.patientId;
    if (ownerId !== userId) {
      throw new ForbiddenError('You can only view your own consultations');
    }
  }

  return consultation;
};

class BookingService {
  bookConsultation(patientId, input) { return bookConsultation(patientId, input); }
  confirmPayment(patientId, paymentIntentId) { return confirmPayment(patientId, paymentIntentId); }
  updateConsultationStatus(id, userId, role, input) { return updateConsultationStatus(id, userId, role, input); }
  getConsultations(userId, role, query) { return getConsultations(userId, role, query); }
  getConsultationById(id, userId, role) { return getConsultationById(id, userId, role); }
}

const bookingService = new BookingService();

module.exports = {
  bookConsultation,
  confirmPayment,
  updateConsultationStatus,
  getConsultations,
  getConsultationById,
  bookingService,
  BookingService
};
