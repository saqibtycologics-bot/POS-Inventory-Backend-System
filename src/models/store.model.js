const mongoose = require('mongoose');

/**
 * Store Schema
 *
 * In our Mini POS system:
 * - A company can have multiple stores/branches.
 * - Every store belongs to exactly one company.
 * - Stores will later own:
 *   - Categories
 *   - Products
 *   - Stock
 *   - Sales
 *
 * Example:
 * Company: "ABC Retail"
 * Stores:
 *   - Lahore Branch
 *   - Karachi Branch
 */
const storeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Store name is required'],
      trim: true,
      minlength: [2, 'Store name must be at least 2 characters long'],
      maxlength: [100, 'Store name cannot exceed 100 characters'],
    },

    phone: {
      type: String,
      trim: true,
      maxlength: [30, 'Phone number cannot exceed 30 characters'],
      default: null,
    },

    address: {
      type: String,
      trim: true,
      maxlength: [300, 'Address cannot exceed 300 characters'],
      default: null,
    },

    /**
     * Store belongs to one company.
     *
     * This is the most important ownership field.
     * It ensures a user can only access stores from their own company.
     */
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company ID is required'],
      index: true,
    },

    /**
     * Tracks who created the store.
     * Currently it will be the logged-in owner user.
     */
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Created by user ID is required'],
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
 * Prevent duplicate store names inside the same company.
 *
 * Allowed:
 * - Company A → Main Branch
 * - Company B → Main Branch
 *
 * Not allowed:
 * - Company A → Main Branch
 * - Company A → Main Branch again
 */
storeSchema.index(
  {
    companyId: 1,
    name: 1,
  },
  {
    unique: true,
  }
);

const Store = mongoose.model('Store', storeSchema);

module.exports = Store;