const Variant = require('../models/variant.model');
const StockMovement = require('../models/stockMovement.model');

const { getErrorResponse } = require('../utils/errorCodes');

/**
 * Find active variant that belongs to the logged-in user's company.
 */
const getOwnedActiveVariant = async (variantId, companyId) => {
  const variant = await Variant.findOne({
    _id: variantId,
    companyId,
    isActive: true,
  });

  if (!variant) {
    throw getErrorResponse('VARIANT_NOT_FOUND');
  }

  return variant;
};

/**
 * Add stock to a variant.
 *
 * Flow:
 * 1. Validate variant ownership
 * 2. Capture previous stock
 * 3. Increase stock
 * 4. Save variant
 * 5. Create StockMovement record of type "in"
 */
const addStock = async (
  { variantId, quantity, note },
  userContext
) => {
  const { userId, companyId } = userContext;

  const variant = await getOwnedActiveVariant(variantId, companyId);

  const previousStock = variant.stock;
  const newStock = previousStock + quantity;

  variant.stock = newStock;
  await variant.save();

  const stockMovement = await StockMovement.create({
    variantId: variant._id,
    productId: variant.productId,
    storeId: variant.storeId,
    companyId,
    type: 'in',
    quantity,
    previousStock,
    newStock,
    note,
    createdBy: userId,
  });

  return {
    variant,
    stockMovement,
  };
};

/**
 * Remove stock manually from a variant.
 *
 * Flow:
 * 1. Validate variant ownership
 * 2. Check enough stock is available
 * 3. Capture previous stock
 * 4. Decrease stock
 * 5. Save variant
 * 6. Create StockMovement record of type "out"
 */
const removeStock = async (
  { variantId, quantity, note },
  userContext
) => {
  const { userId, companyId } = userContext;

  const variant = await getOwnedActiveVariant(variantId, companyId);

  if (variant.stock < quantity) {
    throw getErrorResponse('INSUFFICIENT_STOCK');
  }

  const previousStock = variant.stock;
  const newStock = previousStock - quantity;

  variant.stock = newStock;
  await variant.save();

  const stockMovement = await StockMovement.create({
    variantId: variant._id,
    productId: variant.productId,
    storeId: variant.storeId,
    companyId,
    type: 'out',
    quantity,
    previousStock,
    newStock,
    note,
    createdBy: userId,
  });

  return {
    variant,
    stockMovement,
  };
};

/**
 * Get stock movement history for a variant.
 *
 * Supports pagination.
 */
const getStockHistory = async (
  variantId,
  { page, limit },
  userContext
) => {
  const { companyId } = userContext;

  await getOwnedActiveVariant(variantId, companyId);

  const query = {
    variantId,
    companyId,
  };

  const skip = (page - 1) * limit;

  const [stockMovements, totalMovements] = await Promise.all([
    StockMovement.find(query)
      .populate('variantId', 'name sku')
      .populate('productId', 'name')
      .populate('storeId', 'name')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    StockMovement.countDocuments(query),
  ]);

  const totalPages = Math.ceil(totalMovements / limit);

  return {
    stockMovements,
    pagination: {
      total: totalMovements,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
};

module.exports = {
  addStock,
  removeStock,
  getStockHistory,
};