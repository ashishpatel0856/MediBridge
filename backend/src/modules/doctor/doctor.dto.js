const { z } = require('zod');

const DoctorSearchDto = z.object({
  specialty: z.string().optional(),
  minExperience: z.coerce.number().optional(),
  maxFee: z.coerce.number().optional(),
  minRating: z.coerce.number().optional(),
  language: z.string().optional(),
  query: z.string().optional(),
  isVerified: z.preprocess((val) => val === 'true' || val === true ? true : val === 'false' || val === false ? false : undefined, z.boolean().optional()),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10)
});

const UpdateDoctorProfileDto = z.object({
  specialties: z.array(z.string()).optional(),
  qualifications: z.array(z.string()).optional(),
  experienceYears: z.number().min(0).optional(),
  consultationFee: z.number().min(0).optional(),
  bio: z.string().optional(),
  languages: z.array(z.string()).optional()
});

module.exports = {
  DoctorSearchDto,
  UpdateDoctorProfileDto
};
