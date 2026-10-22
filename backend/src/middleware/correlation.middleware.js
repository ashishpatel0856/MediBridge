const { v4: uuidv4 } = require('uuid');

const correlationMiddleware = (req, res, next) => {
  const correlationId = req.header('x-correlation-id') || req.header('x-request-id') || uuidv4();
  req.correlationId = correlationId;
  req.startTime = Date.now();

  res.setHeader('x-correlation-id', correlationId);
  next();
};

module.exports = { correlationMiddleware };
