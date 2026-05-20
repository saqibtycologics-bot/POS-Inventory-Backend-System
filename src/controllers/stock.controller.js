const stockService = require('../services/stock.service');
const asyncHandler = require('../utils/asyncHandler');
const { getSuccessResponse } = require('../utils/errorCodes');
const { sendSuccessResponse } = require('../utils/responseHandler');

/**
 * Add Stock
 *
 * POST /api/stock/add
 */
const addStock = asyncHandler(async (req, res) => {
  const result = await stockService.addStock(req.body, req.user);

  const response = getSuccessResponse('STOCK_ADDED', result);

  return sendSuccessResponse(res, response);
});

/**
 * Remove Stock
 *
 * POST /api/stock/remove
 */
const removeStock = asyncHandler(async (req, res) => {
  const result = await stockService.removeStock(req.body, req.user);

  const response = getSuccessResponse('STOCK_REMOVED', result);

  return sendSuccessResponse(res, response);
});

/**
 * Get Variant Stock History
 *
 * GET /api/stock/history/:variantId
 */
const getStockHistory = asyncHandler(async (req, res) => {
  const result = await stockService.getStockHistory(
    req.params.variantId,
    req.query,
    req.user
  );

  const response = getSuccessResponse('STOCK_HISTORY_FETCHED', result);

  return sendSuccessResponse(res, response);
});

module.exports = {
  addStock,
  removeStock,
  getStockHistory,
};