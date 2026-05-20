const express = require('express');

const reportController = require('../controllers/report.controller');

const { authMiddleware } = require('../middlewares/auth.middleware');
const { validateRequest } = require('../middlewares/validation.middleware');

const {
  salesReportQuerySchema,
  stockValueReportQuerySchema,
  lowStockReportQuerySchema,
} = require('../validations/report.validation');

const router = express.Router();

/**
 * All report routes are protected.
 */
router.use(authMiddleware);

/**
 * @route   GET /api/reports/sales
 * @access  Private
 *
 * Sales summary report:
 * - total number of sales
 * - total sales amount
 * - total items sold
 *
 * Optional filters:
 * - storeId
 * - startDate
 * - endDate
 */
router.get(
  '/sales',
  validateRequest(salesReportQuerySchema, 'query'),
  reportController.getSalesReport
);

/**
 * @route   GET /api/reports/stock-value
 * @access  Private
 *
 * Current inventory value report:
 * - total active variants
 * - total stock units
 * - total stock value
 *
 * Optional filter:
 * - storeId
 */
router.get(
  '/stock-value',
  validateRequest(stockValueReportQuerySchema, 'query'),
  reportController.getStockValueReport
);

/**
 * @route   GET /api/reports/low-stock
 * @access  Private
 *
 * Low stock report:
 * - variants where stock <= lowStockThreshold
 *
 * Optional filter:
 * - storeId
 */
router.get(
  '/low-stock',
  validateRequest(lowStockReportQuerySchema, 'query'),
  reportController.getLowStockReport
);

module.exports = router;