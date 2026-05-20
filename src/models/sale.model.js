const mongoose = require('mongoose');

/**
 * Sale Schema
 *
 * In our Mini POS system:
 * - A sale belongs to one store
 * - A sale belongs to one company
 * - A sale is created by the logged-in user
 * - Sale items will be stored separately in SaleItem model
 *
 * Important:
 * This model stores the sale-level summary:
 * - total quantity sold
 * - total sale amount
 * - sale date
 */
const saleSchema = new mongoose.Schema(
  {
    /**
     * Store where the sale happened.
     */
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: [true, 'Store ID is required'],
      index: true,
    },

    /**
     * Company owner of this sale.
     */
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company ID is required'],
      index: true,
    },

    /**
     * User who created/performed the sale.
     */
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Created by user ID is required'],
    },

    /**
     * Total number of units sold across all sale items.
     *
     * Example:
     * - Coke x2
     * - Chips x3
     * totalItems = 5
     */
    totalItems: {
      type: Number,
      required: [true, 'Total items count is required'],
      min: [1, 'Total items count must be at least 1'],
    },

    /**
     * Final sale total.
     *
     * For this mini POS:
     * totalAmount = sum(quantity × unitPrice) of all sale items
     */
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative'],
    },

    /**
     * Sale status.
     *
     * Currently every created sale is completed.
     * This field keeps the model extendable for:
     * - voided sales
     * - returned sales
     * - draft sales
     */
    status: {
      type: String,
      enum: ['completed'],
      default: 'completed',
    },

    /**
     * Optional internal note.
     */
    note: {
      type: String,
      trim: true,
      maxlength: [300, 'Note cannot exceed 300 characters'],
      default: null,
    },

    /**
     * Separate explicit sale date.
     *
     * createdAt is also available from timestamps,
     * but saleDate is useful for reporting clarity.
     */
    saleDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/**
 * Useful for sales listing and sales reports.
 */
saleSchema.index({
  companyId: 1,
  storeId: 1,
  saleDate: -1,
});

/**
 * Useful for company-wide report queries.
 */
saleSchema.index({
  companyId: 1,
  saleDate: -1,
});

const Sale = mongoose.model('Sale', saleSchema);

module.exports = Sale;