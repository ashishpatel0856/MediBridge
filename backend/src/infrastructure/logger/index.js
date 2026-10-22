const pino = require('pino');
const { config } = require('../../config/env');

const logger = pino({
  level: config.observability.logLevel || 'info',
  formatters: {
    level: (label) => ({ level: label }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  base: {
    service: 'amrutam-telemedicine-backend',
    env: config.env,
  },
});

const createScopedLogger = (context) => {
  return logger.child(context);
};

module.exports = {
  logger,
  createScopedLogger
};
