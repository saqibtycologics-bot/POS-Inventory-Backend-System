const storeService = require('../services/store.service');
const asyncHandler = require('../utils/asyncHandler');
const { getSuccessResponse } = require('../utils/errorCodes');
const { sendSuccessResponse } = require('../utils/responseHandler');

/**
 * Create Store
 *
 * POST /api/stores
 */
const createStore = asyncHandler(async (req, res) => {
  const store = await storeService.createStore(req.body, req.user);

  const response = getSuccessResponse('STORE_CREATED', {
    store,
  });

  return sendSuccessResponse(res, response);
});

/**
 * Get All Stores
 *
 * GET /api/stores
 *
 * Supports:
 * - page
 * - limit
 * - search
 */
const getStores = asyncHandler(async (req, res) => {
  const result = await storeService.getStores(req.query, req.user);

  const response = getSuccessResponse('STORES_FETCHED', result);

  return sendSuccessResponse(res, response);
});

/**
 * Get Single Store
 *
 * GET /api/stores/:id
 */
const getStoreById = asyncHandler(async (req, res) => {
  const store = await storeService.getStoreById(req.params.id, req.user);

  const response = getSuccessResponse('STORE_FETCHED', {
    store,
  });

  return sendSuccessResponse(res, response);
});

/**
 * Update Store
 *
 * PUT /api/stores/:id
 */
const updateStore = asyncHandler(async (req, res) => {
  const store = await storeService.updateStore(
    req.params.id,
    req.body,
    req.user
  );

  const response = getSuccessResponse('STORE_UPDATED', {
    store,
  });

  return sendSuccessResponse(res, response);
});

/**
 * Delete Store
 *
 * DELETE /api/stores/:id
 *
 * Internally this performs a soft delete:
 * isActive = false
 */
const deleteStore = asyncHandler(async (req, res) => {
  await storeService.deleteStore(req.params.id, req.user);

  const response = getSuccessResponse('STORE_DELETED');

  return sendSuccessResponse(res, response);
});

module.exports = {
  createStore,
  getStores,
  getStoreById,
  updateStore,
  deleteStore,
};