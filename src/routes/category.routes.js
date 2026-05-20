const express = require('express');

const categoryController = require('../controllers/category.controller');

const { authMiddleware } = require('../middlewares/auth.middleware');
const { validateRequest } = require('../middlewares/validation.middleware');

const {
  createCategorySchema,
  updateCategorySchema,
  categoryQuerySchema,
  categoryIdParamSchema,
} = require('../validations/category.validation');

const router = express.Router();

/**
 * All category routes are protected.
 *
 * After authMiddleware:
 * req.user contains:
 * - userId
 * - companyId
 * - role
 */
router.use(authMiddleware);

/**
 * @route   POST /api/categories
 * @access  Private
 *
 * Create category inside a valid store
 * that belongs to the user's company.
 */
router.post(
  '/',
  validateRequest(createCategorySchema, 'body'),
  categoryController.createCategory
);

/**
 * @route   GET /api/categories
 * @access  Private
 *
 * Get all categories for logged-in user's company.
 * Supports:
 * - page
 * - limit
 * - storeId
 * - search
 */
router.get(
  '/',
  validateRequest(categoryQuerySchema, 'query'),
  categoryController.getCategories
);

/**
 * @route   GET /api/categories/:id
 * @access  Private
 *
 * Get one category by ID.
 */
router.get(
  '/:id',
  validateRequest(categoryIdParamSchema, 'params'),
  categoryController.getCategoryById
);

/**
 * @route   PUT /api/categories/:id
 * @access  Private
 *
 * Update category name or description.
 */
router.put(
  '/:id',
  validateRequest(categoryIdParamSchema, 'params'),
  validateRequest(updateCategorySchema, 'body'),
  categoryController.updateCategory
);

/**
 * @route   DELETE /api/categories/:id
 * @access  Private
 *
 * Soft delete category.
 */
router.delete(
  '/:id',
  validateRequest(categoryIdParamSchema, 'params'),
  categoryController.deleteCategory
);

module.exports = router;