const { AppError } = require('../domain/errors/app-errors');
const { logger } = require('../infrastructure/logger');
const { config } = require('../config/env');

const errorHandler = (err, req, res, next) => {
  const correlationId = req.correlationId || 'unknown';

  if (err instanceof AppError) {
    logger.warn(
      {
        correlationId,
        statusCode: err.statusCode,
        error: err.name,
        message: err.message,
        details: err.details,
        path: req.originalUrl,
        method: req.method
      },
      'Operational application error'
    );

    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.name,
        message: err.message,
        details: err.details || null,
        correlationId
      }
    });
    return;
  }

  logger.error(
    {
      correlationId,
      error: err.message,
      stack: err.stack,
      path: req.originalUrl,
      method: req.method
    },
    'Unhandled server error'
  );

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: config.env === 'production' ? 'An unexpected internal error occurred' : err.message,
      correlationId,
      stack: config.env !== 'production' ? err.stack : undefined
    }
  });
};

module.exports = { errorHandler };
