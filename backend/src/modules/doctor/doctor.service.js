const doctorRepository = require('../../repositories/doctor.repository');
const { NotFoundError, ConflictError, ForbiddenError } = require('../../domain/errors/app-errors');

// Search doctors directly via indexed PostgreSQL query
const searchDoctors = async (query) => {
  const page = query.page || 1;
  const limit = query.limit || 10;

  const { doctors, total } = await doctorRepository.searchDoctors(query);

  return {
    data: doctors,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1
    }
  };
};

// Get single doctor profile
const getDoctorById = async (doctorId) => {
  const doctor = await doctorRepository.findById(doctorId);
  if (!doctor) {
    throw new NotFoundError('Doctor not found');
  }
  return doctor;
};

// Update doctor profile (only doctor can update their own)
const updateDoctorProfile = async (userId, input) => {
  const updated = await doctorRepository.updateProfile(userId, input);
  if (!updated) {
    throw new NotFoundError('Doctor record not found');
  }
  return { success: true, message: 'Doctor profile updated successfully' };
};

// Admin verifies a doctor (doctors cannot verify themselves)
const verifyDoctor = async (doctorId, adminUserId) => {
  const doctor = await doctorRepository.findVerificationStatus(doctorId);
  if (!doctor) {
    throw new NotFoundError('Doctor not found');
  }

  // Prevent doctors from verifying themselves
  if (doctor.userId === adminUserId) {
    throw new ForbiddenError('Doctors cannot verify themselves');
  }

  if (doctor.isVerified) {
    throw new ConflictError('Doctor is already verified');
  }

  const verified = await doctorRepository.verifyDoctor(doctorId);
  return verified;
};

module.exports = {
  searchDoctors,
  getDoctorById,
  updateDoctorProfile,
  verifyDoctor
};
