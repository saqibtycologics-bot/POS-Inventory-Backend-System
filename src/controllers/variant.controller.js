const variantService = require('../services/variant.service');
const asyncHandler = require('../utils/asyncHandler');
const { getSuccessResponse } = require('../utils/errorCodes');
const { sendSuccessResponse } = require('../utils/responseHandler');

/**
 * Add Variant to Existing Product
 *
 * POST /api/products/:id/variants
 */
const createVariant = asyncHandler(async (req, res) => {
  const variant = await variantService.createVariant(
    req.params.id,
    req.body,
    req.user
  );

  const response = getSuccessResponse('VARIANT_CREATED', {
    variant,
  });

  return sendSuccessResponse(res, response);
});

/**
 * Update Variant
 *
 * PUT /api/variants/:id
 */
const updateVariant = asyncHandler(async (req, res) => {
  const variant = await variantService.updateVariant(
    req.params.id,
    req.body,
    req.user
  );

  const response = getSuccessResponse('VARIANT_UPDATED', {
    variant,
  });

  return sendSuccessResponse(res, response);
});

/**
 * Soft Delete Variant
 *
 * DELETE /api/variants/:id
 */
const deleteVariant = asyncHandler(async (req, res) => {
  await variantService.deleteVariant(req.params.id, req.user);

  const response = getSuccessResponse('VARIANT_DELETED');

  return sendSuccessResponse(res, response);
});

module.exports = {
  createVariant,
  updateVariant,
  deleteVariant,
};