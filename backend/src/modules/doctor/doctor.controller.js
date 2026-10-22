const doctorService = require('./doctor.service');

const searchDoctors = async (req, res, next) => {
  try {
    const result = await doctorService.searchDoctors(req.query);
    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await doctorService.getDoctorById(req.params.id);
    res.status(200).json({
      success: true,
      data: doctor
    });
  } catch (error) {
    next(error);
  }
};

const updateDoctorProfile = async (req, res, next) => {
  try {
    const result = await doctorService.updateDoctorProfile(req.user.userId, req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const verifyDoctor = async (req, res, next) => {
  try {
    const verified = await doctorService.verifyDoctor(req.params.id, req.user.userId);
    res.status(200).json({
      success: true,
      message: 'Doctor verified successfully',
      data: verified
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  searchDoctors,
  getDoctorById,
  updateDoctorProfile,
  verifyDoctor
};
