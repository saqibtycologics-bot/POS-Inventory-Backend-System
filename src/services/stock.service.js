const { mongoose } = require('../config/db');

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
 * Uses atomic $inc and a transaction so stock updates
 * and movement records stay consistent under concurrency.
 */
const addStock = async ({ variantId, quantity, note }, userContext) => {
  const { userId, companyId } = userContext;

  const session = await mongoose.startSession();
  let result;

  try {
    await session.withTransaction(async () => {
      const updatedVariant = await Variant.findOneAndUpdate(
        {
          _id: variantId,
          companyId,
          isActive: true,
        },
        {
          $inc: {
            stock: quantity,
          },
        },
        {
          new: true,
          session,
        }
      );

      if (!updatedVariant) {
        throw getErrorResponse('VARIANT_NOT_FOUND');
      }

      const previousStock = updatedVariant.stock - quantity;
      const newStock = updatedVariant.stock;

      const [stockMovement] = await StockMovement.create(
        [
          {
            variantId: updatedVariant._id,
            productId: updatedVariant.productId,
            storeId: updatedVariant.storeId,
            companyId,
            type: 'in',
            quantity,
            previousStock,
            newStock,
            note,
            createdBy: userId,
          },
        ],
        { session }
      );

      result = {
        variant: updatedVariant,
        stockMovement,
      };
    });

    return result;
  } finally {
    await session.endSession();
  }
};

/**
 * Remove stock manually from a variant.
 *
 * Uses conditional atomic $inc so concurrent removals
 * cannot drive stock below zero.
 */
const removeStock = async ({ variantId, quantity, note }, userContext) => {
  const { userId, companyId } = userContext;

  const session = await mongoose.startSession();
  let result;

  try {
    await session.withTransaction(async () => {
      const updatedVariant = await Variant.findOneAndUpdate(
        {
          _id: variantId,
          companyId,
          isActive: true,
          stock: { $gte: quantity },
        },
        {
          $inc: {
            stock: -quantity,
          },
        },
        {
          new: true,
          session,
        }
      );

      if (!updatedVariant) {
        const variantExists = await Variant.findOne({
          _id: variantId,
          companyId,
          isActive: true,
        }).session(session);

        if (!variantExists) {
          throw getErrorResponse('VARIANT_NOT_FOUND');
        }

        throw getErrorResponse('INSUFFICIENT_STOCK');
      }

      const previousStock = updatedVariant.stock + quantity;
      const newStock = updatedVariant.stock;

      const [stockMovement] = await StockMovement.create(
        [
          {
            variantId: updatedVariant._id,
            productId: updatedVariant.productId,
            storeId: updatedVariant.storeId,
            companyId,
            type: 'out',
            quantity,
            previousStock,
            newStock,
            note,
            createdBy: userId,
          },
        ],
        { session }
      );

      result = {
        variant: updatedVariant,
        stockMovement,
      };
    });

    return result;
  } finally {
    await session.endSession();
  }
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
