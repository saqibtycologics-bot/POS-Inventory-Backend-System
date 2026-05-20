const rateLimit = require('express-rate-limit');
const { getErrorResponse } = require('../utils/errorCodes');
const { sendErrorResponse } = require('../utils/responseHandler');

/**
 * Shared handler for all rate-limit responses.
 */
const rateLimitHandler = (req, res) => {
  const response = getErrorResponse('TOO_MANY_REQUESTS');
  return sendErrorResponse(res, response);
};

/**
 * General API limiter
 *
 * Applied globally in app.js before routes.
 * Protects the backend from abusive repeated requests.
 */
const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 1000,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: rateLimitHandler,
});

/**
 * Auth limiter
 *
 * Used only on login/register endpoints.
 * Stricter than general traffic because auth endpoints are sensitive.
 */
const authRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: rateLimitHandler,
});

/**
 * Refresh token limiter
 *
 * Used on /refresh endpoint.
 * Prevents excessive token-refresh attempts.
 */
const refreshTokenRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  limit: 30,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: rateLimitHandler,
});

/**
 * Password reset limiter
 *
 * We may not build forgot/reset password in the first auth module,
 * but keeping it ready makes the middleware reusable later.
 */
const passwordResetRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: rateLimitHandler,
});

module.exports = {
  generalRateLimit,
  authRateLimit,
  refreshTokenRateLimit,
  passwordResetRateLimit,
};