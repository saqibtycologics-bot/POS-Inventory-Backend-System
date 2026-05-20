const { getErrorResponse } = require('../utils/errorCodes');
const { sendErrorResponse } = require('../utils/responseHandler');
const { error: logError } = require('../utils/logger');

/**
 * Global Error Handling Middleware
 *
 * This catches:
 * - Errors forwarded through next(error)
 * - Errors passed automatically by asyncHandler
 * - Custom project errors created with getErrorResponse()
 * - Common Mongoose errors
 * - Unknown server errors
 */
const errorHandler = (error, req, res, next) => {
  logError('Unhandled application error', {
    message: error.message,
    code: error.code,
    status: error.status,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
  });

  /**
   * Case 1:
   * Our own standardized project error object
   * Example:
   * throw getErrorResponse('STORE_NOT_FOUND');
   */
  if (error.status && error.code && error.message) {
    return sendErrorResponse(res, error);
  }

  /**
   * Case 2:
   * Invalid MongoDB ObjectId cast error
   */
  if (error.name === 'CastError') {
    const response = getErrorResponse('INVALID_ID_FORMAT');
    return sendErrorResponse(res, response);
  }

  /**
   * Case 3:
   * MongoDB duplicate key error
   * Example:
   * Duplicate email, duplicate SKU, duplicate store name if indexed
   */
  if (error.code === 11000) {
    const duplicateField = Object.keys(error.keyValue || {})[0];

    const response = getErrorResponse('RESOURCE_ALREADY_EXISTS', {
      details: duplicateField
        ? `${duplicateField} already exists.`
        : 'Duplicate value detected.',
    });

    return sendErrorResponse(res, response);
  }

  /**
   * Case 4:
   * Mongoose schema validation error
   */
  if (error.name === 'ValidationError') {
    const validationErrors = Object.values(error.errors).map((item) => ({
      field: item.path,
      message: item.message,
    }));

    const response = getErrorResponse('VALIDATION_ERROR', {
      errors: validationErrors,
    });

    return sendErrorResponse(res, response);
  }

  /**
   * Case 5:
   * Fallback unknown error
   */
  const response = getErrorResponse('INTERNAL_SERVER_ERROR', {
    ...(process.env.NODE_ENV === 'development' && {
      debug: error.message,
    }),
  });

  return sendErrorResponse(res, response);
};

/**
 * 404 Route Not Found Middleware
 *
 * This should be placed after all actual routes in app.js.
 */
const notFoundHandler = (req, res) => {
  const response = getErrorResponse('ROUTE_NOT_FOUND', {
    path: req.originalUrl,
  });

  return sendErrorResponse(res, response);
};

module.exports = {
  errorHandler,
  notFoundHandler,
};