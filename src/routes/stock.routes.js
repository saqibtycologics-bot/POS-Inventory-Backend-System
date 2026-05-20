const express = require('express');

const stockController = require('../controllers/stock.controller');

const { authMiddleware } = require('../middlewares/auth.middleware');
const { validateRequest } = require('../middlewares/validation.middleware');

const {
  addStockSchema,
  removeStockSchema,
  stockHistoryParamSchema,
  stockHistoryQuerySchema,
} = require('../validations/stock.validation');

const router = express.Router();

/**
 * All stock routes are protected.
 */
router.use(authMiddleware);

/**
 * @route   POST /api/stock/add
 * @access  Private
 *
 * Add stock to a variant.
 */
router.post(
  '/add',
  validateRequest(addStockSchema, 'body'),
  stockController.addStock
);

/**
 * @route   POST /api/stock/remove
 * @access  Private
 *
 * Remove stock manually from a variant.
 */
router.post(
  '/remove',
  validateRequest(removeStockSchema, 'body'),
  stockController.removeStock
);

/**
 * @route   GET /api/stock/history/:variantId
 * @access  Private
 *
 * Get stock movement history for a variant.
 */
router.get(
  '/history/:variantId',
  validateRequest(stockHistoryParamSchema, 'params'),
  validateRequest(stockHistoryQuerySchema, 'query'),
  stockController.getStockHistory
);

module.exports = router;