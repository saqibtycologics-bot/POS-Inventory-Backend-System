const categoryService = require('../services/category.service');
const asyncHandler = require('../utils/asyncHandler');
const { getSuccessResponse } = require('../utils/errorCodes');
const { sendSuccessResponse } = require('../utils/responseHandler');

/**
 * Create Category
 *
 * POST /api/categories
 */
const createCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.createCategory(req.body, req.user);

  const response = getSuccessResponse('CATEGORY_CREATED', {
    category,
  });

  return sendSuccessResponse(res, response);
});

/**
 * Get All Categories
 *
 * GET /api/categories
 *
 * Supports:
 * - page
 * - limit
 * - storeId
 * - search
 */
const getCategories = asyncHandler(async (req, res) => {
  const result = await categoryService.getCategories(req.query, req.user);

  const response = getSuccessResponse('CATEGORIES_FETCHED', result);

  return sendSuccessResponse(res, response);
});

/**
 * Get Single Category
 *
 * GET /api/categories/:id
 */
const getCategoryById = asyncHandler(async (req, res) => {
  const category = await categoryService.getCategoryById(
    req.params.id,
    req.user
  );

  const response = getSuccessResponse('CATEGORY_FETCHED', {
    category,
  });

  return sendSuccessResponse(res, response);
});

/**
 * Update Category
 *
 * PUT /api/categories/:id
 */
const updateCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.updateCategory(
    req.params.id,
    req.body,
    req.user
  );

  const response = getSuccessResponse('CATEGORY_UPDATED', {
    category,
  });

  return sendSuccessResponse(res, response);
});

/**
 * Delete Category
 *
 * DELETE /api/categories/:id
 *
 * Internally this performs soft delete:
 * isActive = false
 */
const deleteCategory = asyncHandler(async (req, res) => {
  await categoryService.deleteCategory(req.params.id, req.user);

  const response = getSuccessResponse('CATEGORY_DELETED');

  return sendSuccessResponse(res, response);
});

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};