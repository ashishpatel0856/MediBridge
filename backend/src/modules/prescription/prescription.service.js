const { v4: uuidv4 } = require('uuid');
const prescriptionRepo = require('../../repositories/prescription.repository');
const { jobQueue } = require('../../infrastructure/queue/job-queue');
const { generatePrescriptionSignature, verifyPrescriptionSignature } = require('../../infrastructure/security/crypto');
const { BadRequestError, ForbiddenError, NotFoundError, ConflictError } = require('../../domain/errors/app-errors');

// Create a tamper-evident digital prescription with HMAC-SHA256 signature
const createPrescription = async (doctorIdUserId, input) => {
  const doctor = await prescriptionRepo.findDoctorByUserId(doctorIdUserId);
  if (!doctor) {
    throw new ForbiddenError('Only registered doctors can issue prescriptions');
  }

  const consultation = await prescriptionRepo.findConsultationById(input.consultationId);
  if (!consultation) {
    throw new NotFoundError('Consultation not found');
  }

  const consultationDoctorId = consultation.doctor_id || consultation.doctorId;
  if (consultationDoctorId !== doctor.id) {
    throw new ForbiddenError('You can only issue prescriptions for consultations assigned to you');
  }

  if (consultation.status === 'CANCELLED') {
    throw new BadRequestError('Cannot issue prescription for a cancelled consultation');
  }

  const existingRx = await prescriptionRepo.findExistingPrescription(input.consultationId);
  if (existingRx) {
    throw new ConflictError('A prescription has already been issued for this consultation');
  }

  const prescriptionId = uuidv4();
  const patientId = consultation.patient_id || consultation.patientId;
  const createdAt = new Date();

  const digitalSignature = generatePrescriptionSignature({
    consultationId: input.consultationId,
    doctorId: doctor.id,
    patientId,
    diagnosis: input.diagnosis,
    medications: input.medications,
    timestamp: createdAt
  });

  const prescription = await prescriptionRepo.createPrescriptionTransaction({
    id: prescriptionId,
    consultationId: input.consultationId,
    doctorId: doctor.id,
    patientId,
    diagnosis: input.diagnosis,
    medications: input.medications,
    instructions: input.instructions || null,
    followUpDate: input.followUpDate || null,
    digitalSignature,
    createdAt
  });

  // Async notification via background job queue
  await jobQueue.add('send_prescription_notification', {
    prescriptionId,
    patientEmail: `patient-${patientId.slice(0, 6)}@amrutam.co.in`
  });

  return prescription;
};

// Retrieve prescription by consultation ID with access control
const getPrescriptionByConsultation = async (consultationId, userId, userRole) => {
  const prescription = await prescriptionRepo.findPrescriptionDetails(consultationId);
  if (!prescription) {
    throw new NotFoundError('No prescription found for this consultation');
  }

  const rxPatientId = prescription.patient_id || prescription.patientId;
  if (userRole === 'PATIENT' && rxPatientId !== userId) {
    throw new ForbiddenError('You can only view your own prescriptions');
  }

  return prescription;
};

// Cryptographically verify prescription signature
const verifySignature = async (input) => {
  return verifyPrescriptionSignature(
    {
      consultationId: input.consultationId,
      doctorId: input.doctorId,
      patientId: input.patientId,
      diagnosis: input.diagnosis,
      medications: input.medications,
      timestamp: input.timestamp
    },
    input.signature
  );
};

module.exports = {
  createPrescription,
  getPrescriptionByConsultation,
  verifySignature,
  prescriptionService: {
    createPrescription,
    getPrescriptionByConsultation,
    verifySignature
  }
};
