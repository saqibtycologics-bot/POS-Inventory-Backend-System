const reportService = require('../services/report.service');
const asyncHandler = require('../utils/asyncHandler');
const { getSuccessResponse } = require('../utils/errorCodes');
const { sendSuccessResponse } = require('../utils/responseHandler');

/**
 * Get Sales Report
 *
 * GET /api/reports/sales
 *
 * Supports:
 * - storeId
 * - startDate
 * - endDate
 */
const getSalesReport = asyncHandler(async (req, res) => {
  const result = await reportService.getSalesReport(req.query, req.user);

  const response = getSuccessResponse('SALES_REPORT_FETCHED', result);

  return sendSuccessResponse(res, response);
});

/**
 * Get Stock Value Report
 *
 * GET /api/reports/stock-value
 *
 * Supports:
 * - storeId
 */
const getStockValueReport = asyncHandler(async (req, res) => {
  const result = await reportService.getStockValueReport(req.query, req.user);

  const response = getSuccessResponse(
    'STOCK_VALUE_REPORT_FETCHED',
    result
  );

  return sendSuccessResponse(res, response);
});

/**
 * Get Low Stock Report
 *
 * GET /api/reports/low-stock
 *
 * Supports:
 * - storeId
 * - page
 * - limit
 */
const getLowStockReport = asyncHandler(async (req, res) => {
  const result = await reportService.getLowStockReport(req.query, req.user);

  const response = getSuccessResponse('LOW_STOCK_REPORT_FETCHED', result);

  return sendSuccessResponse(res, response);
});

module.exports = {
  getSalesReport,
  getStockValueReport,
  getLowStockReport,
};