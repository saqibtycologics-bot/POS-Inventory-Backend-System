const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const dayjs = require('dayjs');

const { mongoose } = require('../config/db');

const User = require('../models/user.model');
const Company = require('../models/company.model');
const jwtConfig = require('../config/jwtConfig');
const { getErrorResponse } = require('../utils/errorCodes');

/**
 * Number of bcrypt salt rounds for password hashing.
 */
const PASSWORD_SALT_ROUNDS = 12;

/**
 * Hash a plain password before saving it in database.
 */
const hashPassword = async (plainPassword) => {
  return bcrypt.hash(plainPassword, PASSWORD_SALT_ROUNDS);
};

/**
 * Compare plain password with stored password hash.
 */
const comparePassword = async (plainPassword, passwordHash) => {
  return bcrypt.compare(plainPassword, passwordHash);
};

/**
 * Generate Access Token
 *
 * Short-lived token used for protected API access.
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      companyId: user.companyId,
      role: user.role,
      tokenType: 'access',
    },
    jwtConfig.accessToken.secret,
    {
      expiresIn: jwtConfig.accessToken.expiresIn,
    }
  );
};

/**
 * Generate Refresh Token
 *
 * Long-lived token used only to request a new access token.
 */
const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      tokenType: 'refresh',
    },
    jwtConfig.refreshToken.secret,
    {
      expiresIn: jwtConfig.refreshToken.expiresIn,
    }
  );
};

/**
 * Hash refresh token before storing it in database.
 *
 * Refresh tokens are high-entropy strings, so SHA-256 hashing
 * is suitable for secure lookup/storage without storing raw token value.
 */
const hashRefreshToken = (refreshToken) => {
  return crypto
    .createHash('sha256')
    .update(refreshToken)
    .digest('hex');
};

/**
 * Calculate refresh token DB expiry date.
 *
 * Our .env currently uses:
 * COOKIE_EXPIRES_IN_DAYS=7
 *
 * We keep DB refresh-token expiry aligned with cookie lifetime.
 */
const getRefreshTokenExpiryDate = () => {
  const expiryDays = Number(process.env.COOKIE_EXPIRES_IN_DAYS || 7);
  return dayjs().add(expiryDays, 'day').toDate();
};

/**
 * Remove sensitive fields before returning user data.
 */
const sanitizeUser = (user) => {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    companyId: user.companyId,
    role: user.role,
    lastLoginAt: user.lastLoginAt,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

/**
 * Register user + company
 *
 * Flow:
 * 1. Check duplicate email
 * 2. Hash password
 * 3. Create user temporarily without companyId
 * 4. Create company with ownerId
 * 5. Link companyId back to user
 * 6. Generate access + refresh tokens
 * 7. Store hashed refresh token in DB
 */
const register = async ({ name, email, password, companyName }) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw getErrorResponse('USER_ALREADY_EXISTS');
  }

  const passwordHash = await hashPassword(password);

  const session = await mongoose.startSession();
  let result;

  try {
    await session.withTransaction(async () => {
      const [user] = await User.create(
        [
          {
            name,
            email,
            passwordHash,
          },
        ],
        { session }
      );

      const [company] = await Company.create(
        [
          {
            name: companyName,
            ownerId: user._id,
          },
        ],
        { session }
      );

      user.companyId = company._id;

      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      user.refreshTokenHash = hashRefreshToken(refreshToken);
      user.refreshTokenExpiresAt = getRefreshTokenExpiryDate();

      await user.save({ session });

      result = {
        user: sanitizeUser(user),
        company: {
          id: company._id,
          name: company.name,
          ownerId: company.ownerId,
          isActive: company.isActive,
          createdAt: company.createdAt,
          updatedAt: company.updatedAt,
        },
        accessToken,
        refreshToken,
      };
    });

    return result;
  } finally {
    await session.endSession();
  }
};

/**
 * Login user
 *
 * Flow:
 * 1. Find user by email and include hidden fields
 * 2. Compare password
 * 3. Generate new access + refresh tokens
 * 4. Replace previous refresh token hash
 * 5. Update lastLoginAt
 */
const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select(
    '+passwordHash +refreshTokenHash +refreshTokenExpiresAt'
  );

  if (!user) {
    throw getErrorResponse('INVALID_CREDENTIALS');
  }

  if (!user.isActive) {
    throw getErrorResponse('FORBIDDEN_ACCESS');
  }

  const isPasswordValid = await comparePassword(password, user.passwordHash);

  if (!isPasswordValid) {
    throw getErrorResponse('INVALID_CREDENTIALS');
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshTokenHash = hashRefreshToken(refreshToken);
  user.refreshTokenExpiresAt = getRefreshTokenExpiryDate();
  user.lastLoginAt = new Date();

  await user.save();

  return {
    user: sanitizeUser(user),
    accessToken,
    refreshToken,
  };
};

/**
 * Refresh access token
 *
 * Flow:
 * 1. Verify refresh token signature
 * 2. Confirm it is refresh token type
 * 3. Find user
 * 4. Compare incoming refresh token hash with stored DB hash
 * 5. Check DB expiry
 * 6. Generate a new access token
 */
const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) {
    throw getErrorResponse('REFRESH_TOKEN_MISSING');
  }

  let decodedToken;

  try {
    decodedToken = jwt.verify(
      refreshToken,
      jwtConfig.refreshToken.secret
    );
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw getErrorResponse('REFRESH_TOKEN_EXPIRED');
    }

    throw getErrorResponse('REFRESH_TOKEN_INVALID');
  }

  if (decodedToken.tokenType !== 'refresh') {
    throw getErrorResponse('REFRESH_TOKEN_INVALID');
  }

  const user = await User.findById(decodedToken.userId).select(
    '+refreshTokenHash +refreshTokenExpiresAt'
  );

  if (!user) {
    throw getErrorResponse('USER_NOT_FOUND');
  }

  if (!user.refreshTokenHash || !user.refreshTokenExpiresAt) {
    throw getErrorResponse('REFRESH_TOKEN_REVOKED');
  }

  const incomingRefreshTokenHash = hashRefreshToken(refreshToken);

  if (incomingRefreshTokenHash !== user.refreshTokenHash) {
    throw getErrorResponse('REFRESH_TOKEN_REVOKED');
  }

  if (dayjs().isAfter(dayjs(user.refreshTokenExpiresAt))) {
    user.refreshTokenHash = null;
    user.refreshTokenExpiresAt = null;
    await user.save();

    throw getErrorResponse('REFRESH_TOKEN_EXPIRED');
  }

  const accessToken = generateAccessToken(user);

  return {
    accessToken,
  };
};

/**
 * Logout user
 *
 * Flow:
 * 1. Find user
 * 2. Clear stored refresh token hash
 * 3. Client-side refresh-token cookie will also be cleared in controller
 */
const logout = async (userId) => {
  const user = await User.findById(userId).select(
    '+refreshTokenHash +refreshTokenExpiresAt'
  );

  if (!user) {
    throw getErrorResponse('USER_NOT_FOUND');
  }

  user.refreshTokenHash = null;
  user.refreshTokenExpiresAt = null;

  await user.save();

  return true;
};

/**
 * Get logged-in user's profile
 */
const getProfile = async (userId) => {
  const user = await User.findById(userId).populate(
    'companyId',
    'name ownerId isActive createdAt updatedAt'
  );

  if (!user) {
    throw getErrorResponse('USER_NOT_FOUND');
  }

  return {
    user: sanitizeUser(user),
    company: user.companyId,
  };
};

module.exports = {
  register,
  login,
  refreshAccessToken,
  logout,
  getProfile,
};