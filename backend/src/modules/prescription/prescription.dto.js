const { z } = require('zod');

const MedicationSchema = z.object({
  medicineName: z.string().min(1, 'Medicine name is required'),
  dosage: z.string().min(1, 'Dosage is required (e.g., 500mg, 2 tablets)'),
  frequency: z.string().min(1, 'Frequency is required (e.g., Twice daily after meals)'),
  duration: z.string().min(1, 'Duration is required (e.g., 7 days)'),
  instructions: z.string().optional()
});

const CreatePrescriptionDto = z.object({
  consultationId: z.string().uuid('Valid consultation ID required'),
  diagnosis: z.string().min(3, 'Diagnosis is required'),
  medications: z.array(MedicationSchema).min(1, 'At least one medication is required'),
  instructions: z.string().optional(),
  followUpDate: z.string().optional()
});

const VerifyPrescriptionDto = z.object({
  consultationId: z.string().uuid(),
  doctorId: z.string().uuid(),
  patientId: z.string().uuid(),
  diagnosis: z.string(),
  medications: z.array(MedicationSchema),
  timestamp: z.string(),
  signature: z.string()
});

module.exports = {
  MedicationSchema,
  CreatePrescriptionDto,
  VerifyPrescriptionDto
};
