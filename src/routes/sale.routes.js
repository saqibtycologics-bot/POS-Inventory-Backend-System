const express = require('express');

const saleController = require('../controllers/sale.controller');

const { authMiddleware } = require('../middlewares/auth.middleware');
const { validateRequest } = require('../middlewares/validation.middleware');

const {
  createSaleSchema,
  saleQuerySchema,
  saleIdParamSchema,
} = require('../validations/sale.validation');

const router = express.Router();

/**
 * All sale routes are protected.
 */
router.use(authMiddleware);

/**
 * @route   POST /api/sales
 * @access  Private
 *
 * Create a sale:
 * - Reduces stock
 * - Creates sale summary
 * - Creates sale items
 * - Creates stock movement history
 */
router.post(
  '/',
  validateRequest(createSaleSchema, 'body'),
  saleController.createSale
);

/**
 * @route   GET /api/sales
 * @access  Private
 *
 * Get all sales for logged-in user's company.
 * Supports:
 * - page
 * - limit
 * - storeId
 * - startDate
 * - endDate
 */
router.get(
  '/',
  validateRequest(saleQuerySchema, 'query'),
  saleController.getSales
);

/**
 * @route   GET /api/sales/:id
 * @access  Private
 *
 * Get one sale with its sale items.
 */
router.get(
  '/:id',
  validateRequest(saleIdParamSchema, 'params'),
  saleController.getSaleById
);

module.exports = router;