const Product = require('../models/product.model');
const Variant = require('../models/variant.model');

const { getErrorResponse } = require('../utils/errorCodes');

/**
 * Add a new variant to an existing product.
 *
 * Flow:
 * 1. Confirm product exists and belongs to logged-in user's company.
 * 2. Check whether SKU already exists globally.
 * 3. Create variant under that product.
 * 4. Mark product.hasVariants = true if product now has multiple variants.
 */
const createVariant = async (productId, payload, userContext) => {
  const { userId, companyId } = userContext;

  const product = await Product.findOne({
    _id: productId,
    companyId,
    isActive: true,
  });

  if (!product) {
    throw getErrorResponse('PRODUCT_NOT_FOUND');
  }

  const normalizedSku = payload.sku.trim().toUpperCase();

  const existingVariant = await Variant.findOne({
    sku: normalizedSku,
  });

  if (existingVariant) {
    throw getErrorResponse('VARIANT_ALREADY_EXISTS', {
      details: `SKU ${normalizedSku} already exists.`,
    });
  }

  const variant = await Variant.create({
    name: payload.name,
    sku: normalizedSku,
    price: payload.price,
    costPrice: payload.costPrice,
    stock: payload.stock ?? 0,
    lowStockThreshold: payload.lowStockThreshold ?? 5,
    attributes: payload.attributes || {},
    productId: product._id,
    storeId: product.storeId,
    companyId,
    createdBy: userId,
    isDefault: false,
  });

  const activeVariantCount = await Variant.countDocuments({
    productId: product._id,
    companyId,
    isActive: true,
  });

  product.hasVariants = activeVariantCount > 1;
  await product.save();

  return variant;
};

/**
 * Update an existing variant.
 *
 * Allowed updates:
 * - name
 * - sku
 * - price
 * - costPrice
 * - lowStockThreshold
 * - attributes
 *
 * Stock is NOT updated here.
 * Stock changes only through Stock Module APIs.
 */
const updateVariant = async (
  variantId,
  updatePayload,
  userContext
) => {
  const { companyId } = userContext;

  const variant = await Variant.findOne({
    _id: variantId,
    companyId,
    isActive: true,
  });

  if (!variant) {
    throw getErrorResponse('VARIANT_NOT_FOUND');
  }

  /**
   * If SKU is changing, ensure the new SKU is still globally unique.
   */
  if (updatePayload.sku) {
    const normalizedSku = updatePayload.sku.trim().toUpperCase();

    if (normalizedSku !== variant.sku) {
      const duplicateVariant = await Variant.findOne({
        _id: { $ne: variantId },
        sku: normalizedSku,
      });

      if (duplicateVariant) {
        throw getErrorResponse('VARIANT_ALREADY_EXISTS', {
          details: `SKU ${normalizedSku} already exists.`,
        });
      }

      variant.sku = normalizedSku;
    }
  }

  if (updatePayload.name !== undefined) {
    variant.name = updatePayload.name;
  }

  if (updatePayload.price !== undefined) {
    variant.price = updatePayload.price;
  }

  if (updatePayload.costPrice !== undefined) {
    variant.costPrice = updatePayload.costPrice;
  }

  if (updatePayload.lowStockThreshold !== undefined) {
    variant.lowStockThreshold = updatePayload.lowStockThreshold;
  }

  if (updatePayload.attributes !== undefined) {
    variant.attributes = updatePayload.attributes;
  }

  await variant.save();

  return variant;
};

/**
 * Soft delete variant.
 *
 * Rules:
 * - A product must always have at least one active variant.
 * - If deleting one variant leaves only one active variant:
 *   - product.hasVariants becomes false
 *   - remaining variant becomes default
 */
const deleteVariant = async (variantId, userContext) => {
  const { companyId } = userContext;

  const variant = await Variant.findOne({
    _id: variantId,
    companyId,
    isActive: true,
  });

  if (!variant) {
    throw getErrorResponse('VARIANT_NOT_FOUND');
  }

  const activeVariants = await Variant.find({
    productId: variant.productId,
    companyId,
    isActive: true,
  });

  if (activeVariants.length <= 1) {
    throw getErrorResponse('DEFAULT_VARIANT_REQUIRED');
  }

  variant.isActive = false;
  await variant.save();

  const remainingVariants = await Variant.find({
    productId: variant.productId,
    companyId,
    isActive: true,
  });

  const product = await Product.findOne({
    _id: variant.productId,
    companyId,
    isActive: true,
  });

  if (product) {
    if (remainingVariants.length === 1) {
      product.hasVariants = false;

      remainingVariants[0].isDefault = true;
      await remainingVariants[0].save();
    } else {
      product.hasVariants = true;
    }

    await product.save();
  }

  return true;
};

module.exports = {
  createVariant,
  updateVariant,
  deleteVariant,
};