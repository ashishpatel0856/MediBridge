const prescriptionService = require('./prescription.service');

// Issue a cryptographically signed prescription
const createPrescription = async (req, res, next) => {
  try {
    const doctorIdUserId = req.user.userId;
    const result = await prescriptionService.createPrescription(doctorIdUserId, req.body);
    return res.status(201).json({
      success: true,
      message: 'Prescription issued with cryptographic digital signature',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// Retrieve prescription by consultation ID
const getPrescription = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const role = req.user.role;
    const result = await prescriptionService.getPrescriptionByConsultation(req.params.consultationId, userId, role);
    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// Verify digital signature validity
const verifySignature = async (req, res, next) => {
  try {
    const isValid = await prescriptionService.verifySignature(req.body);
    return res.status(200).json({
      success: true,
      data: {
        isValid,
        verifiedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPrescription,
  getPrescription,
  verifySignature,
  prescriptionController: {
    createPrescription,
    getPrescription,
    verifySignature
  }
};
