const express = require('express');

const authController = require('../controllers/auth.controller');

const { authMiddleware } = require('../middlewares/auth.middleware');
const {
  authRateLimit,
  refreshTokenRateLimit,
} = require('../middlewares/rateLimit.middleware');
const {
  validateRequest,
} = require('../middlewares/validation.middleware');

const {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  logoutSchema,
} = require('../validations/auth.validation');

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @access  Public
 *
 * Register:
 * - User
 * - Company
 * - Access token
 * - Refresh token cookie
 */
router.post(
  '/register',
  authRateLimit,
  validateRequest(registerSchema, 'body'),
  authController.register
);

/**
 * @route   POST /api/auth/login
 * @access  Public
 *
 * Login:
 * - Verify email/password
 * - Return access token
 * - Set refresh token cookie
 */
router.post(
  '/login',
  authRateLimit,
  validateRequest(loginSchema, 'body'),
  authController.login
);

/**
 * @route   POST /api/auth/refresh
 * @access  Public, but requires refresh token cookie
 *
 * Generate a new access token using refresh token.
 */
router.post(
  '/refresh',
  refreshTokenRateLimit,
  validateRequest(refreshTokenSchema, 'body'),
  authController.refreshAccessToken
);

/**
 * @route   POST /api/auth/logout
 * @access  Private
 *
 * Logout:
 * - Requires valid access token
 * - Clears stored refresh token hash
 * - Clears refresh token cookie
 */
router.post(
  '/logout',
  authMiddleware,
  validateRequest(logoutSchema, 'body'),
  authController.logout
);

/**
 * @route   GET /api/auth/profile
 * @access  Private
 *
 * Return currently authenticated user profile.
 */
router.get(
  '/profile',
  authMiddleware,
  authController.getProfile
);

module.exports = router;