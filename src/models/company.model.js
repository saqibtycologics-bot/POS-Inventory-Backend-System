const mongoose = require('mongoose');

/**
 * Company Schema
 *
 * Example:
 * Company: "Tycologics Mart"
 * Stores:
 *   - Lahore Branch
 *   - Karachi Branch
 */
const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      minlength: [2, 'Company name must be at least 2 characters long'],
      maxlength: [100, 'Company name cannot exceed 100 characters'],
    },

    /**
     * Company owner
     *
     * During registration:
     * 1. User is created
     * 2. Company is created
     * 3. This owner field stores that user's ID
     */
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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
 * Index for faster company name lookup.
 * Not unique because different users may create companies with same display name.
 */
companySchema.index({ name: 1 });

const Company = mongoose.model('Company', companySchema);

module.exports = Company;