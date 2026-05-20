const productService = require('../services/product.service');
const asyncHandler = require('../utils/asyncHandler');
const { getSuccessResponse } = require('../utils/errorCodes');
const { sendSuccessResponse } = require('../utils/responseHandler');

/**
 * Create Product with Variants
 *
 * POST /api/products
 */
const createProduct = asyncHandler(async (req, res) => {
  const result = await productService.createProduct(req.body, req.user);

  const response = getSuccessResponse('PRODUCT_CREATED', result);

  return sendSuccessResponse(res, response);
});

/**
 * Get All Products
 *
 * GET /api/products
 *
 * Supports:
 * - page
 * - limit
 * - storeId
 * - categoryId
 * - search
 */
const getProducts = asyncHandler(async (req, res) => {
  const result = await productService.getProducts(req.query, req.user);

  const response = getSuccessResponse('PRODUCTS_FETCHED', result);

  return sendSuccessResponse(res, response);
});

/**
 * Get Single Product with Variants
 *
 * GET /api/products/:id
 */
const getProductById = asyncHandler(async (req, res) => {
  const result = await productService.getProductById(
    req.params.id,
    req.user
  );

  const response = getSuccessResponse('PRODUCT_FETCHED', result);

  return sendSuccessResponse(res, response);
});

/**
 * Update Product-Level Information
 *
 * PUT /api/products/:id
 *
 * Updates:
 * - name
 * - description
 * - basePrice
 *
 * Variants are managed separately in Variant Module.
 */
const updateProduct = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(
    req.params.id,
    req.body,
    req.user
  );

  const response = getSuccessResponse('PRODUCT_UPDATED', {
    product,
  });

  return sendSuccessResponse(res, response);
});

/**
 * Soft Delete Product and Its Active Variants
 *
 * DELETE /api/products/:id
 */
const deleteProduct = asyncHandler(async (req, res) => {
  await productService.deleteProduct(req.params.id, req.user);

  const response = getSuccessResponse('PRODUCT_DELETED');

  return sendSuccessResponse(res, response);
});

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};