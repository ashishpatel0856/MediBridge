const { ForbiddenError, UnauthorizedError } = require('../domain/errors/app-errors');
const userRepository = require('../repositories/user.repository');

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `Access denied. Role '${req.user.role}' is not authorized to perform this action. Required: [${allowedRoles.join(', ')}]`
        )
      );
    }

    next();
  };
};

// Guard ensuring a doctor must be verified before performing clinical operations
const requireVerifiedDoctor = async (req, res, next) => {
  if (!req.user) {
    return next(new UnauthorizedError('Authentication required'));
  }

  // Admins bypass verification checks
  if (req.user.role === 'ADMIN') {
    return next();
  }

  if (req.user.role !== 'DOCTOR') {
    return next(new ForbiddenError('Only doctors can perform this action'));
  }

  const verified = await userRepository.isDoctorVerified(req.user.userId);
  if (!verified) {
    return next(new ForbiddenError('Doctor profile is pending verification. You cannot perform this action until verified.'));
  }

  next();
};

module.exports = {
  requireRole,
  requireVerifiedDoctor
};
