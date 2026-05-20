const express = require('express');

const storeController = require('../controllers/store.controller');

const { authMiddleware } = require('../middlewares/auth.middleware');
const { validateRequest } = require('../middlewares/validation.middleware');

const {
  createStoreSchema,
  updateStoreSchema,
  storeQuerySchema,
  storeIdParamSchema,
} = require('../validations/store.validation');

const router = express.Router();

/**
 * All store routes are protected.
 *
 * After this middleware:
 * req.user will contain:
 * - userId
 * - companyId
 * - role
 */
router.use(authMiddleware);

/**
 * @route   POST /api/stores
 * @access  Private
 *
 * Create a new store for the logged-in user's company.
 */
router.post(
  '/',
  validateRequest(createStoreSchema, 'body'),
  storeController.createStore
);

/**
 * @route   GET /api/stores
 * @access  Private
 *
 * Get all stores of the logged-in user's company.
 * Supports:
 * - page
 * - limit
 * - search
 */
router.get(
  '/',
  validateRequest(storeQuerySchema, 'query'),
  storeController.getStores
);

/**
 * @route   GET /api/stores/:id
 * @access  Private
 *
 * Get a single store by ID.
 */
router.get(
  '/:id',
  validateRequest(storeIdParamSchema, 'params'),
  storeController.getStoreById
);

/**
 * @route   PUT /api/stores/:id
 * @access  Private
 *
 * Update store details.
 */
router.put(
  '/:id',
  validateRequest(storeIdParamSchema, 'params'),
  validateRequest(updateStoreSchema, 'body'),
  storeController.updateStore
);

/**
 * @route   DELETE /api/stores/:id
 * @access  Private
 *
 * Soft delete the store.
 */
router.delete(
  '/:id',
  validateRequest(storeIdParamSchema, 'params'),
  storeController.deleteStore
);

module.exports = router;