const authService = require('./auth.service');

const registerPatient = async (req, res, next) => {
  try {
    const result = await authService.registerPatient(req.body);
    res.status(201).json({
      success: true,
      message: 'Patient registered successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const registerDoctor = async (req, res, next) => {
  try {
    const result = await authService.registerDoctor(req.body);
    res.status(201).json({
      success: true,
      message: 'Doctor registered successfully. Account is pending verification.',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.status(200).json({
      success: true,
      message: result.mfaRequired ? 'MFA verification required' : 'Login successful',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const setupMfa = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const result = await authService.setupMfa(userId);
    res.status(200).json({
      success: true,
      message: 'MFA setup initiated. Scan the QR code with your Authenticator app',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const verifyMfa = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    await authService.verifyAndEnableMfa(userId, req.body.code);
    res.status(200).json({
      success: true,
      message: 'MFA 2FA successfully verified and activated'
    });
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const result = await authService.refreshToken(req.body.refreshToken);
    res.status(200).json({
      success: true,
      message: 'Tokens refreshed successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const userRepository = require('../../repositories/user.repository');

const getMe = async (req, res, next) => {
  try {
    let isVerified = undefined;
    if (req.user.role === 'DOCTOR') {
      isVerified = await userRepository.isDoctorVerified(req.user.userId);
    }
    res.status(200).json({
      success: true,
      data: {
        ...req.user,
        ...(isVerified !== undefined ? { isVerified } : {})
      }
    });
  } catch (error) {
    next(error);
  }
};

// Class wrapper for backward compatibility with route imports
class AuthController {
  registerPatient(req, res, next) { return registerPatient(req, res, next); }
  registerDoctor(req, res, next) { return registerDoctor(req, res, next); }
  login(req, res, next) { return login(req, res, next); }
  setupMfa(req, res, next) { return setupMfa(req, res, next); }
  verifyMfa(req, res, next) { return verifyMfa(req, res, next); }
  refreshToken(req, res, next) { return refreshToken(req, res, next); }
  getMe(req, res, next) { return getMe(req, res, next); }
}

const authController = new AuthController();

module.exports = {
  registerPatient,
  registerDoctor,
  login,
  setupMfa,
  verifyMfa,
  refreshToken,
  getMe,
  authController,
  AuthController
};
