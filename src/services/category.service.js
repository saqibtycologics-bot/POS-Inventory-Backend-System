const Category = require('../models/category.model');
const Store = require('../models/store.model');
const { getErrorResponse } = require('../utils/errorCodes');

/**
 * Create category inside a store.
 *
 * Flow:
 * 1. Confirm the store exists and belongs to the logged-in user's company.
 * 2. Check duplicate active category name inside that store.
 * 3. Create category with companyId + createdBy from authenticated user.
 */
const createCategory = async (
  { storeId, name, description },
  userContext
) => {
  const { userId, companyId } = userContext;

  const store = await Store.findOne({
    _id: storeId,
    companyId,
    isActive: true,
  });

  if (!store) {
    throw getErrorResponse('STORE_NOT_FOUND');
  }

  const existingCategory = await Category.findOne({
    storeId,
    companyId,
    name,
    isActive: true,
  });

  if (existingCategory) {
    throw getErrorResponse('CATEGORY_ALREADY_EXISTS');
  }

  const category = await Category.create({
    name,
    description,
    storeId,
    companyId,
    createdBy: userId,
  });

  return category;
};

/**
 * Get all active categories of the logged-in user's company.
 *
 * Supports:
 * - Pagination
 * - Search by category name
 * - Optional filter by storeId
 */
const getCategories = async (
  { page, limit, storeId, search },
  userContext
) => {
  const { companyId } = userContext;

  const query = {
    companyId,
    isActive: true,
  };

  if (storeId) {
    const store = await Store.findOne({
      _id: storeId,
      companyId,
      isActive: true,
    });

    if (!store) {
      throw getErrorResponse('STORE_NOT_FOUND');
    }

    query.storeId = storeId;
  }

  if (search) {
    query.name = {
      $regex: search,
      $options: 'i',
    };
  }

  const skip = (page - 1) * limit;

  const [categories, totalCategories] = await Promise.all([
    Category.find(query)
      .populate('storeId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    Category.countDocuments(query),
  ]);

  const totalPages = Math.ceil(totalCategories / limit);

  return {
    categories,
    pagination: {
      total: totalCategories,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
};

/**
 * Get one active category by ID.
 *
 * Security:
 * Category must belong to the logged-in user's company.
 */
const getCategoryById = async (categoryId, userContext) => {
  const { companyId } = userContext;

  const category = await Category.findOne({
    _id: categoryId,
    companyId,
    isActive: true,
  }).populate('storeId', 'name');

  if (!category) {
    throw getErrorResponse('CATEGORY_NOT_FOUND');
  }

  return category;
};

/**
 * Update category.
 *
 * Store cannot be changed through update API.
 * Only name and description are updateable.
 */
const updateCategory = async (
  categoryId,
  updatePayload,
  userContext
) => {
  const { companyId } = userContext;

  const category = await Category.findOne({
    _id: categoryId,
    companyId,
    isActive: true,
  });

  if (!category) {
    throw getErrorResponse('CATEGORY_NOT_FOUND');
  }

  if (updatePayload.name && updatePayload.name !== category.name) {
    const duplicateCategory = await Category.findOne({
      _id: { $ne: categoryId },
      storeId: category.storeId,
      companyId,
      name: updatePayload.name,
      isActive: true,
    });

    if (duplicateCategory) {
      throw getErrorResponse('CATEGORY_ALREADY_EXISTS');
    }
  }

  if (updatePayload.name !== undefined) {
    category.name = updatePayload.name;
  }

  if (updatePayload.description !== undefined) {
    category.description = updatePayload.description;
  }

  await category.save();

  return category;
};

/**
 * Soft delete category.
 *
 * Later, before finishing Product Module, we may enhance this by checking:
 * - Is any active product attached to this category?
 *
 * For now:
 * - Soft delete using isActive = false
 */
const deleteCategory = async (categoryId, userContext) => {
  const { companyId } = userContext;

  const category = await Category.findOne({
    _id: categoryId,
    companyId,
    isActive: true,
  });

  if (!category) {
    throw getErrorResponse('CATEGORY_NOT_FOUND');
  }

  category.isActive = false;
  await category.save();

  return true;
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};