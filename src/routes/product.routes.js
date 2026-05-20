const express = require('express');

const productController = require('../controllers/product.controller');

const { authMiddleware } = require('../middlewares/auth.middleware');
const { validateRequest } = require('../middlewares/validation.middleware');

const {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
  productIdParamSchema,
} = require('../validations/product.validation');

const router = express.Router();

/**
 * All product routes are protected.
 *
 * After authMiddleware:
 * req.user contains:
 * - userId
 * - companyId
 * - role
 */
router.use(authMiddleware);

/**
 * @route   POST /api/products
 * @access  Private
 *
 * Create a product with one or multiple variants.
 */
router.post(
  '/',
  validateRequest(createProductSchema, 'body'),
  productController.createProduct
);

/**
 * @route   GET /api/products
 * @access  Private
 *
 * Get all products for the logged-in user's company.
 * Supports:
 * - page
 * - limit
 * - storeId
 * - categoryId
 * - search
 */
router.get(
  '/',
  validateRequest(productQuerySchema, 'query'),
  productController.getProducts
);

/**
 * @route   GET /api/products/:id
 * @access  Private
 *
 * Get one product with all active variants.
 */
router.get(
  '/:id',
  validateRequest(productIdParamSchema, 'params'),
  productController.getProductById
);

/**
 * @route   PUT /api/products/:id
 * @access  Private
 *
 * Update product-level fields:
 * - name
 * - description
 * - basePrice
 */
router.put(
  '/:id',
  validateRequest(productIdParamSchema, 'params'),
  validateRequest(updateProductSchema, 'body'),
  productController.updateProduct
);

/**
 * @route   DELETE /api/products/:id
 * @access  Private
 *
 * Soft delete product and its active variants.
 */
router.delete(
  '/:id',
  validateRequest(productIdParamSchema, 'params'),
  productController.deleteProduct
);

module.exports = router;