const mongoose = require('mongoose');

/**
 * Stock Movement Schema
 *
 * This model stores the history of every inventory change.
 *
 * Why it exists:
 * - Variant.stock stores the current quantity.
 * - StockMovement stores how that quantity changed over time.
 *
 * Example movements:
 * - Add 20 units manually
 * - Remove 5 damaged units
 * - Sale deducts 2 units automatically
 */
const stockMovementSchema = new mongoose.Schema(
  {
    /**
     * Variant whose stock changed.
     */
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Variant',
      required: [true, 'Variant ID is required'],
      index: true,
    },

    /**
     * Product reference helps reporting/filtering later.
     */
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product ID is required'],
      index: true,
    },

    /**
     * Store where this stock belongs.
     */
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: [true, 'Store ID is required'],
      index: true,
    },

    /**
     * Company owner of this inventory movement.
     */
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company ID is required'],
      index: true,
    },

    /**
     * Type of stock change.
     *
     * in         → stock added
     * out        → stock manually removed
     * sale       → stock deducted due to sale
     * adjustment → reserved for future corrections
     */
    type: {
      type: String,
      enum: ['in', 'out', 'sale', 'adjustment'],
      required: [true, 'Stock movement type is required'],
    },

    /**
     * Quantity moved in this transaction.
     * Always stored as positive number.
     *
     * The type tells whether it increases or decreases stock.
     */
    quantity: {
      type: Number,
      required: [true, 'Stock movement quantity is required'],
      min: [1, 'Stock movement quantity must be at least 1'],
    },

    /**
     * Stock before the movement.
     */
    previousStock: {
      type: Number,
      required: [true, 'Previous stock is required'],
      min: [0, 'Previous stock cannot be negative'],
    },

    /**
     * Stock after the movement.
     */
    newStock: {
      type: Number,
      required: [true, 'New stock is required'],
      min: [0, 'New stock cannot be negative'],
    },

    /**
     * Optional text note.
     *
     * Examples:
     * - "Opening inventory"
     * - "Damaged items removed"
     * - "Sale order #123"
     */
    note: {
      type: String,
      trim: true,
      maxlength: [300, 'Note cannot exceed 300 characters'],
      default: null,
    },

    /**
     * Who performed the stock change.
     *
     * For manual add/remove:
     * - logged-in user ID
     *
     * For sale-based deduction:
     * - logged-in cashier/owner user ID
     */
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Created by user ID is required'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/**
 * Useful for retrieving a variant's movement history efficiently.
 */
stockMovementSchema.index({
  variantId: 1,
  createdAt: -1,
});

/**
 * Useful for store/company-level stock reports.
 */
stockMovementSchema.index({
  companyId: 1,
  storeId: 1,
  createdAt: -1,
});

const StockMovement = mongoose.model(
  'StockMovement',
  stockMovementSchema
);

module.exports = StockMovement;