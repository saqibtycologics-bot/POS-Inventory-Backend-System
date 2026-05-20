const authService = require('../services/auth.service');
const asyncHandler = require('../utils/asyncHandler');
const { getSuccessResponse } = require('../utils/errorCodes');
const { sendSuccessResponse } = require('../utils/responseHandler');

/**
 * Cookie configuration for refresh token.
 *
 * Refresh token is stored in an httpOnly cookie:
 * - httpOnly: JavaScript in browser cannot read it
 * - secure: true only in production HTTPS
 * - sameSite: strict helps reduce CSRF risk for our current setup
 */
const getRefreshTokenCookieOptions = () => {
  const cookieExpiryDays = Number(process.env.COOKIE_EXPIRES_IN_DAYS || 7);

  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: cookieExpiryDays * 24 * 60 * 60 * 1000,
  };
};

/**
 * Register User + Company
 *
 * POST /api/auth/register
 */
const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);

  res.cookie(
    'refreshToken',
    result.refreshToken,
    getRefreshTokenCookieOptions()
  );

  const response = getSuccessResponse('USER_REGISTERED', {
    user: result.user,
    company: result.company,
    accessToken: result.accessToken,
  });

  return sendSuccessResponse(res, response);
});

/**
 * Login User
 *
 * POST /api/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);

  res.cookie(
    'refreshToken',
    result.refreshToken,
    getRefreshTokenCookieOptions()
  );

  const response = getSuccessResponse('LOGIN_SUCCESS', {
    user: result.user,
    accessToken: result.accessToken,
  });

  return sendSuccessResponse(res, response);
});

/**
 * Refresh Access Token
 *
 * POST /api/auth/refresh
 *
 * Refresh token is read from httpOnly cookie.
 */
const refreshAccessToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  const result = await authService.refreshAccessToken(refreshToken);

  const response = getSuccessResponse('TOKEN_REFRESHED', {
    accessToken: result.accessToken,
  });

  return sendSuccessResponse(res, response);
});

/**
 * Logout User
 *
 * POST /api/auth/logout
 *
 * authMiddleware provides req.user.userId.
 */
const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user.userId);

  res.clearCookie('refreshToken', getRefreshTokenCookieOptions());

  const response = getSuccessResponse('LOGOUT_SUCCESS');

  return sendSuccessResponse(res, response);
});

/**
 * Get Logged-in User Profile
 *
 * GET /api/auth/profile
 */
const getProfile = asyncHandler(async (req, res) => {
  const result = await authService.getProfile(req.user.userId);

  const response = getSuccessResponse('PROFILE_FETCHED', result);

  return sendSuccessResponse(res, response);
});

module.exports = {
  register,
  login,
  refreshAccessToken,
  logout,
  getProfile,
};