const express = require('express');

const variantController = require('../controllers/variant.controller');

const { authMiddleware } = require('../middlewares/auth.middleware');
const { validateRequest } = require('../middlewares/validation.middleware');

const {
  createVariantSchema,
  updateVariantSchema,
  productIdParamSchema,
  variantIdParamSchema,
} = require('../validations/variant.validation');

const router = express.Router();

/**
 * All variant routes are protected.
 */
router.use(authMiddleware);

/**
 * @route   POST /api/products/:id/variants
 * @access  Private
 *
 * Add a new variant to an existing product.
 */
router.post(
  '/products/:id/variants',
  validateRequest(productIdParamSchema, 'params'),
  validateRequest(createVariantSchema, 'body'),
  variantController.createVariant
);

/**
 * @route   PUT /api/variants/:id
 * @access  Private
 *
 * Update variant-level fields.
 */
router.put(
  '/variants/:id',
  validateRequest(variantIdParamSchema, 'params'),
  validateRequest(updateVariantSchema, 'body'),
  variantController.updateVariant
);

/**
 * @route   DELETE /api/variants/:id
 * @access  Private
 *
 * Soft delete a variant safely.
 */
router.delete(
  '/variants/:id',
  validateRequest(variantIdParamSchema, 'params'),
  variantController.deleteVariant
);

module.exports = router;