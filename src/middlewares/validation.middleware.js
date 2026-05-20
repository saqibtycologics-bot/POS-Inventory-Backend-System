const { getErrorResponse } = require('../utils/errorCodes');
const { sendErrorResponse } = require('../utils/responseHandler');

/**
 * Generic Zod validation middleware.
 *
 * source can be:
 * - body   => req.body
 * - params => req.params
 * - query  => req.query
 */
const validateRequest = (schema, source = 'body') => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const validationErrors = result.error.issues.map((issue) => ({
        field: issue.path.join('.') || source,
        message: issue.message,
      }));

      const response = getErrorResponse('VALIDATION_ERROR', {
        errors: validationErrors,
      });

      return sendErrorResponse(res, response);
    }

    /**
     * Replace original request data with validated/cleaned data.
     * Example: email trim/lowercase, numbers converted, etc.
     */
    if (source === 'query') {
      Object.defineProperty(req, 'query', {
        value: result.data,
        writable: true,
        configurable: true,
        enumerable: true,
      });
    } else {
      req[source] = result.data;
    }

    return next();
  };
};

module.exports = {
  validateRequest,
};