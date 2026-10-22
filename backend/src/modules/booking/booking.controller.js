const bookingService = require('./booking.service');

const bookConsultation = async (req, res, next) => {
  try {
    const patientId = req.user.userId;
    const result = await bookingService.bookConsultation(patientId, req.body);
    res.status(201).json({
      success: true,
      message: 'Slot reserved. Complete payment to confirm booking.',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const confirmPayment = async (req, res, next) => {
  try {
    const patientId = req.user.userId;
    const { paymentIntentId } = req.body;
    const result = await bookingService.confirmPayment(patientId, paymentIntentId);
    res.status(200).json({
      success: true,
      message: 'Payment confirmed. Consultation is now scheduled.',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const updateConsultationStatus = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const role = req.user.role;
    const consultation = await bookingService.updateConsultationStatus(req.params.id, userId, role, req.body);
    res.status(200).json({
      success: true,
      message: `Consultation status updated to ${req.body.status}`,
      data: consultation
    });
  } catch (error) {
    next(error);
  }
};

const getConsultations = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const role = req.user.role;
    const result = await bookingService.getConsultations(userId, role, req.query);
    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

const getConsultationById = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const role = req.user.role;
    const consultation = await bookingService.getConsultationById(req.params.id, userId, role);
    res.status(200).json({
      success: true,
      data: consultation
    });
  } catch (error) {
    next(error);
  }
};

// Kept class wrapper for backward compatibility with route imports
class BookingController {
  bookConsultation(req, res, next) { return bookConsultation(req, res, next); }
  confirmPayment(req, res, next) { return confirmPayment(req, res, next); }
  updateConsultationStatus(req, res, next) { return updateConsultationStatus(req, res, next); }
  getConsultations(req, res, next) { return getConsultations(req, res, next); }
  getConsultationById(req, res, next) { return getConsultationById(req, res, next); }
}

const bookingController = new BookingController();

module.exports = {
  bookConsultation,
  confirmPayment,
  updateConsultationStatus,
  getConsultations,
  getConsultationById,
  bookingController,
  BookingController
};
