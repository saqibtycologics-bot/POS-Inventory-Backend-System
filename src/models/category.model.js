const mongoose = require('mongoose');

/**
 * Category Schema
 *
 * In our Mini POS system:
 * - A category belongs to one store.
 * - A category belongs indirectly to one company through companyId.
 * - Products will later belong to categories.
 *
 * Example:
 * Store: Main Branch
 * Categories:
 *   - Beverages
 *   - Snacks
 *   - Electronics
 */
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      minlength: [2, 'Category name must be at least 2 characters long'],
      maxlength: [100, 'Category name cannot exceed 100 characters'],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [300, 'Description cannot exceed 300 characters'],
      default: null,
    },

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
 * Prevent duplicate category names inside the same store.
 *
 * Allowed:
 * - Store A → Beverages
 * - Store B → Beverages
 *
 * Not allowed:
 * - Store A → Beverages
 * - Store A → Beverages again
 */
categorySchema.index(
  {
    storeId: 1,
    name: 1,
  },
  {
    unique: true,
  }
);

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;