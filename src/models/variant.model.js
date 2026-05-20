const mongoose = require('mongoose');

/**
 * Variant Schema
 *
 * In our Mini POS system:
 * - Every Product has at least one Variant.
 * - Simple product → one default variant.
 * - Product with sizes/colors → multiple variants.
 *
 * Variant owns:
 * - SKU
 * - Selling price
 * - Cost price
 * - Current stock quantity
 * - Low stock threshold
 * - Flexible attributes like color, size, weight, etc.
 */
const variantSchema = new mongoose.Schema(
  {
    /**
     * Variant display name
     *
     * Examples:
     * - "Default"
     * - "Red / XL"
     * - "500ml"
     */
    name: {
      type: String,
      required: [true, 'Variant name is required'],
      trim: true,
      minlength: [1, 'Variant name is required'],
      maxlength: [100, 'Variant name cannot exceed 100 characters'],
    },

    /**
     * SKU must be unique within the whole system.
     *
     * Examples:
     * - COKE-500ML
     * - SHIRT-RED-XL
     */
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      trim: true,
      uppercase: true,
      unique: true,
    },

    /**
     * Selling price of this specific variant.
     */
    price: {
      type: Number,
      required: [true, 'Variant price is required'],
      min: [0, 'Variant price cannot be negative'],
    },

    /**
     * Cost price is needed later for:
     * - Stock value report
     * - Gross margin/profit reporting in future
     */
    costPrice: {
      type: Number,
      required: [true, 'Cost price is required'],
      min: [0, 'Cost price cannot be negative'],
    },

    /**
     * Current available stock.
     *
     * Stock changes later through Stock Module:
     * - Add stock
     * - Remove stock
     * - Sale deduction
     */
    stock: {
      type: Number,
      default: 0,
      min: [0, 'Stock cannot be negative'],
    },

    /**
     * Low stock level for report alerts.
     *
     * Example:
     * threshold = 5
     * stock = 4
     * → appears in low stock report
     */
    lowStockThreshold: {
      type: Number,
      default: 5,
      min: [0, 'Low stock threshold cannot be negative'],
    },

    /**
     * Flexible attributes.
     *
     * Stored as a Map:
     * {
     *   color: "Red",
     *   size: "XL"
     * }
     */
    attributes: {
      type: Map,
      of: String,
      default: {},
    },

    /**
     * Variant belongs to one Product.
     */
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product ID is required'],
      index: true,
    },

    /**
     * Variant also stores store/company ownership
     * to make filtering and authorization easier later.
     */
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: [true, 'Store ID is required'],
      index: true,
    },

    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company ID is required'],
      index: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Created by user ID is required'],
    },

    /**
     * Marks the auto-created default variant
     * for products that do not have custom variants.
     */
    isDefault: {
      type: Boolean,
      default: false,
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
 * Faster lookup when loading variants for a product.
 */
variantSchema.index({
  productId: 1,
  isActive: 1,
});

/**
 * Useful for stock/report filters by company/store.
 */
variantSchema.index({
  companyId: 1,
  storeId: 1,
  isActive: 1,
});

const Variant = mongoose.model('Variant', variantSchema);

module.exports = Variant;