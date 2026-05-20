const mongoose = require('mongoose');

/**
 * Product Schema
 *
 * In our Mini POS system:
 * - A product belongs to one company
 * - A product belongs to one store
 * - A product belongs to one category
 * - A product can have one or many variants
 *
 * Important:
 * Stock will NOT be stored directly on Product.
 * Stock will be managed through Variant records.
 */
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      minlength: [2, 'Product name must be at least 2 characters long'],
      maxlength: [150, 'Product name cannot exceed 150 characters'],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: null,
    },

    /**
     * Base/default display price of the product.
     *
     * Actual selling price during sale will come from Variant.price.
     * This is useful for:
     * - Product listing
     * - Showing a default price
     * - Future analytics
     */
    basePrice: {
      type: Number,
      required: [true, 'Base price is required'],
      min: [0, 'Base price cannot be negative'],
    },

    /**
     * Product belongs to a category.
     */
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category ID is required'],
      index: true,
    },

    /**
     * Product belongs to a store.
     */
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: [true, 'Store ID is required'],
      index: true,
    },

    /**
     * Product belongs to a company.
     *
     * This protects company-level data isolation.
     */
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
     * Indicates whether this product currently has
     * multiple meaningful variants or only one default variant.
     *
     * Even simple products will still get one Variant record,
     * so stock logic stays consistent.
     */
    hasVariants: {
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
 * Prevent duplicate active product names inside the same store.
 *
 * Allowed:
 * - Store A → Coca Cola
 * - Store B → Coca Cola
 *
 * Not allowed:
 * - Store A → Coca Cola
 * - Store A → Coca Cola again
 */
productSchema.index(
  {
    storeId: 1,
    name: 1,
  },
  {
    unique: true,
  }
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;