const { ZodError } = require('zod');
const { ValidationError } = require('../domain/errors/app-errors');

const validateRequest = (schemas) => {
  return async (req, res, next) => {
    try {
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      if (schemas.query) {
        req.query = await schemas.query.parseAsync(req.query);
      }
      if (schemas.params) {
        req.params = await schemas.params.parseAsync(req.params);
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message
        }));
        return next(new ValidationError('Input validation failed', formattedErrors));
      }
      next(error);
    }
  };
};

module.exports = { validateRequest };
