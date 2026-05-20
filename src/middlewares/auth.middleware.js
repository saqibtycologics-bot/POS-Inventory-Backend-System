const jwt = require('jsonwebtoken');

const jwtConfig = require('../config/jwtConfig');
const { getErrorResponse } = require('../utils/errorCodes');
const { sendErrorResponse } = require('../utils/responseHandler');

/**
 * Access Token Authentication Middleware
 *
 * Purpose:
 * - Protect private APIs
 * - Read Bearer token from Authorization header
 * - Verify access token
 * - Attach decoded user data to req.user
 *
 * Expected header:
 * Authorization: Bearer <accessToken>
 */
const authMiddleware = (req, res, next) => {
  const authorizationHeader = req.headers.authorization;

  /**
   * Case 1:
   * Authorization header is missing
   */
  if (!authorizationHeader) {
    const response = getErrorResponse('ACCESS_TOKEN_MISSING');
    return sendErrorResponse(res, response);
  }

  /**
   * Case 2:
   * Header format must be:
   * Bearer token_here
   */
  const [tokenType, accessToken] = authorizationHeader.split(' ');

  if (tokenType !== 'Bearer' || !accessToken) {
    const response = getErrorResponse('ACCESS_TOKEN_INVALID');
    return sendErrorResponse(res, response);
  }

  try {
    /**
     * Verify token signature + expiry
     */
    const decodedToken = jwt.verify(
      accessToken,
      jwtConfig.accessToken.secret
    );

    /**
     * Extra safety:
     * Make sure refresh token is never used as access token.
     */
    if (decodedToken.tokenType !== 'access') {
      const response = getErrorResponse('ACCESS_TOKEN_INVALID');
      return sendErrorResponse(res, response);
    }

    /**
     * Attach authenticated identity to request.
     *
     * Later modules use:
     * req.user.userId
     * req.user.companyId
     * req.user.role
     */
    req.user = {
      userId: decodedToken.userId,
      companyId: decodedToken.companyId,
      role: decodedToken.role,
    };

    return next();
  } catch (error) {
    /**
     * Token expired
     */
    if (error.name === 'TokenExpiredError') {
      const response = getErrorResponse('ACCESS_TOKEN_EXPIRED');
      return sendErrorResponse(res, response);
    }

    /**
     * Invalid signature, malformed token, wrong secret, etc.
     */
    const response = getErrorResponse('ACCESS_TOKEN_INVALID');
    return sendErrorResponse(res, response);
  }
};

module.exports = {
  authMiddleware,
};