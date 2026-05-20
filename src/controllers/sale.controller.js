const saleService = require('../services/sale.service');
const asyncHandler = require('../utils/asyncHandler');
const { getSuccessResponse } = require('../utils/errorCodes');
const { sendSuccessResponse } = require('../utils/responseHandler');

/**
 * Create Sale
 *
 * POST /api/sales
 *
 * This will:
 * - Create sale summary
 * - Create sale items
 * - Reduce variant stock
 * - Create stock movement history
 */
const createSale = asyncHandler(async (req, res) => {
  const result = await saleService.createSale(req.body, req.user);

  const response = getSuccessResponse('SALE_CREATED', result);

  return sendSuccessResponse(res, response);
});

/**
 * Get All Sales
 *
 * GET /api/sales
 *
 * Supports:
 * - page
 * - limit
 * - storeId
 * - startDate
 * - endDate
 */
const getSales = asyncHandler(async (req, res) => {
  const result = await saleService.getSales(req.query, req.user);

  const response = getSuccessResponse('SALES_FETCHED', result);

  return sendSuccessResponse(res, response);
});

/**
 * Get Single Sale with Sale Items
 *
 * GET /api/sales/:id
 */
const getSaleById = asyncHandler(async (req, res) => {
  const result = await saleService.getSaleById(
    req.params.id,
    req.user
  );

  const response = getSuccessResponse('SALE_FETCHED', result);

  return sendSuccessResponse(res, response);
});

module.exports = {
  createSale,
  getSales,
  getSaleById,
};