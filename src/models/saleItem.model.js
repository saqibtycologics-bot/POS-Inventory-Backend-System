const mongoose = require('mongoose');

/**
 * Sale Item Schema
 *
 * In our Mini POS system:
 * - One Sale can contain many SaleItems.
 * - Each SaleItem represents one sold product variant.
 *
 * Example:
 * Sale:
 *   - Coke 500ml x 2
 *   - Chips Large x 1
 *
 * Stored as:
 *   SaleItem 1 → Coke variant, quantity 2
 *   SaleItem 2 → Chips variant, quantity 1
 */
const saleItemSchema = new mongoose.Schema(
  {
    /**
     * Parent sale reference.
     */
    saleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sale',
      required: [true, 'Sale ID is required'],
      index: true,
    },

    /**
     * Sold variant reference.
     */
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Variant',
      required: [true, 'Variant ID is required'],
      index: true,
    },

    /**
     * Product reference is stored directly for easier reports/history.
     */
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product ID is required'],
      index: true,
    },

    /**
     * Store where this sale happened.
     */
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: [true, 'Store ID is required'],
      index: true,
    },

    /**
     * Company owner of this sale item.
     */
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company ID is required'],
      index: true,
    },

    /**
     * Quantity sold of this variant.
     */
    quantity: {
      type: Number,
      required: [true, 'Sale item quantity is required'],
      min: [1, 'Sale item quantity must be at least 1'],
    },

    /**
     * Selling price captured at the time of sale.
     *
     * Important:
     * We do NOT rely on current Variant.price later,
     * because variant price may change after the sale.
     */
    unitPrice: {
      type: Number,
      required: [true, 'Unit price is required'],
      min: [0, 'Unit price cannot be negative'],
    },

    /**
     * Cost price captured at time of sale.
     *
     * Useful for future gross profit reports.
     */
    unitCostPrice: {
      type: Number,
      required: [true, 'Unit cost price is required'],
      min: [0, 'Unit cost price cannot be negative'],
    },

    /**
     * subtotal = quantity × unitPrice
     */
    subtotal: {
      type: Number,
      required: [true, 'Subtotal is required'],
      min: [0, 'Subtotal cannot be negative'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/**
 * Faster retrieval of all items belonging to a sale.
 */
saleItemSchema.index({
  saleId: 1,
});

/**
 * Useful later for item-level sales reports.
 */
saleItemSchema.index({
  companyId: 1,
  storeId: 1,
  productId: 1,
  variantId: 1,
  createdAt: -1,
});

const SaleItem = mongoose.model('SaleItem', saleItemSchema);

module.exports = SaleItem;