const mongoose = require('mongoose');

/**
 * User Schema
 *
 * In our Mini POS system:
 * - A user registers with name, email, and password.
 * - During registration, one company is also created.
 * - The user is linked to that company through companyId.
 * - We also store refresh tokens so logout/token rotation can be handled safely.
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'User name is required'],
      trim: true,
      minlength: [2, 'User name must be at least 2 characters long'],
      maxlength: [50, 'User name cannot exceed 50 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      unique: true,
    },

    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
      select: false,
    },

    /**
     * Each user belongs to one company.
     * This becomes important later for:
     * - Store ownership
     * - Category isolation
     * - Product isolation
     * - Sales/report isolation
     */
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      default: null,
      index: true,
    },

    role: {
      type: String,
      enum: ['owner'],
      default: 'owner',
    },

    /**
     * Refresh token storage
     *
     * For our current mini POS:
     * - One active refresh token is enough.
     * - On login, a new refresh token is stored.
     * - On logout, it is cleared.
     * - On refresh, we can verify the token against DB.
     *
     * In a future advanced system, this can become:
     * refreshTokens: [{ tokenHash, deviceId, expiresAt }]
     */
    refreshTokenHash: {
      type: String,
      default: null,
      select: false,
    },

    refreshTokenExpiresAt: {
      type: Date,
      default: null,
      select: false,
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/**
 * Prevent duplicate email issues cleanly at database level.
 */
userSchema.index({ email: 1 }, { unique: true });

const User = mongoose.model('User', userSchema);

module.exports = User;