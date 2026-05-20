const dayjs = require('dayjs');

const { mongoose } = require('../config/db');

const Sale = require('../models/sale.model');
const SaleItem = require('../models/saleItem.model');
const Variant = require('../models/variant.model');
const StockMovement = require('../models/stockMovement.model');
const Store = require('../models/store.model');

const { getErrorResponse } = require('../utils/errorCodes');

/**
 * Ensure the store exists, is active,
 * and belongs to the logged-in user's company.
 */
const ensureValidStore = async (storeId, companyId, session = null) => {
  const query = Store.findOne({
    _id: storeId,
    companyId,
    isActive: true,
  });

  if (session) {
    query.session(session);
  }

  const store = await query;

  if (!store) {
    throw getErrorResponse('STORE_NOT_FOUND');
  }

  return store;
};

/**
 * Create a sale and automatically reduce stock.
 *
 * Flow:
 * 1. Validate store belongs to user's company
 * 2. For each sale item:
 *    - Find matching variant in the same store/company
 *    - Ensure stock is sufficient
 *    - Deduct stock atomically
 *    - Prepare SaleItem payload
 *    - Prepare StockMovement payload
 * 3. Create Sale summary
 * 4. Create SaleItems
 * 5. Create StockMovement records of type "sale"
 *
 * All steps run in one DB session/transaction-style workflow.
 */
const createSale = async ({ storeId, items, note }, userContext) => {
  const { userId, companyId } = userContext;

  const session = await mongoose.startSession();

  let result;

  try {
    await session.withTransaction(async () => {
      await ensureValidStore(storeId, companyId, session);

      const preparedSaleItems = [];
      const preparedStockMovements = [];

      let totalItems = 0;
      let totalAmount = 0;

      for (const item of items) {
        /**
         * Atomic stock deduction:
         * Stock is reduced only if enough stock exists.
         */
        const updatedVariant = await Variant.findOneAndUpdate(
          {
            _id: item.variantId,
            companyId,
            storeId,
            isActive: true,
            stock: { $gte: item.quantity },
          },
          {
            $inc: {
              stock: -item.quantity,
            },
          },
          {
            new: true,
            session,
          }
        );

        /**
         * If update failed, determine whether:
         * - Variant does not exist
         * - Variant exists but stock is insufficient
         */
        if (!updatedVariant) {
          const variantExists = await Variant.findOne({
            _id: item.variantId,
            companyId,
            storeId,
            isActive: true,
          }).session(session);

          if (!variantExists) {
            throw getErrorResponse('VARIANT_NOT_FOUND');
          }

          throw getErrorResponse('INSUFFICIENT_STOCK', {
            details: `Insufficient stock for variant SKU ${variantExists.sku}.`,
          });
        }

        const previousStock = updatedVariant.stock + item.quantity;
        const newStock = updatedVariant.stock;

        const subtotal = item.quantity * updatedVariant.price;

        totalItems += item.quantity;
        totalAmount += subtotal;

        preparedSaleItems.push({
          variantId: updatedVariant._id,
          productId: updatedVariant.productId,
          storeId,
          companyId,
          quantity: item.quantity,
          unitPrice: updatedVariant.price,
          unitCostPrice: updatedVariant.costPrice,
          subtotal,
        });

        preparedStockMovements.push({
          variantId: updatedVariant._id,
          productId: updatedVariant.productId,
          storeId,
          companyId,
          type: 'sale',
          quantity: item.quantity,
          previousStock,
          newStock,
          note: note
            ? `Stock reduced from sale: ${note}`
            : 'Stock reduced from sale',
          createdBy: userId,
        });
      }

      /**
       * Create Sale summary.
       */
      const sale = new Sale({
        storeId,
        companyId,
        createdBy: userId,
        totalItems,
        totalAmount,
        note,
        saleDate: new Date(),
      });

      await sale.save({ session });

      /**
       * Attach saleId to all sale line items.
       */
      const saleItemsPayload = preparedSaleItems.map((saleItem) => ({
        ...saleItem,
        saleId: sale._id,
      }));

      const createdSaleItems = await SaleItem.insertMany(
        saleItemsPayload,
        { session }
      );

      const createdStockMovements = await StockMovement.insertMany(
        preparedStockMovements,
        { session }
      );

      result = {
        sale,
        saleItems: createdSaleItems,
        stockMovements: createdStockMovements,
      };
    });

    return result;
  } finally {
    await session.endSession();
  }
};

/**
 * Get all sales for logged-in user's company.
 *
 * Supports:
 * - Pagination
 * - Store filter
 * - Date range filter
 */
const getSales = async (
  { page, limit, storeId, startDate, endDate },
  userContext
) => {
  const { companyId } = userContext;

  const query = {
    companyId,
  };

  if (storeId) {
    await ensureValidStore(storeId, companyId);
    query.storeId = storeId;
  }

  if (startDate || endDate) {
    query.saleDate = {};

    if (startDate) {
      query.saleDate.$gte = dayjs(startDate).startOf('day').toDate();
    }

    if (endDate) {
      query.saleDate.$lte = dayjs(endDate).endOf('day').toDate();
    }
  }

  const skip = (page - 1) * limit;

  const [sales, totalSales] = await Promise.all([
    Sale.find(query)
      .populate('storeId', 'name')
      .populate('createdBy', 'name email')
      .sort({ saleDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit),

    Sale.countDocuments(query),
  ]);

  const totalPages = Math.ceil(totalSales / limit);

  return {
    sales,
    pagination: {
      total: totalSales,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
};

/**
 * Get one sale with all sale items.
 */
const getSaleById = async (saleId, userContext) => {
  const { companyId } = userContext;

  const sale = await Sale.findOne({
    _id: saleId,
    companyId,
  })
    .populate('storeId', 'name')
    .populate('createdBy', 'name email');

  if (!sale) {
    throw getErrorResponse('SALE_NOT_FOUND');
  }

  const saleItems = await SaleItem.find({
    saleId,
    companyId,
  })
    .populate('productId', 'name')
    .populate('variantId', 'name sku price costPrice');

  return {
    sale,
    saleItems,
  };
};

module.exports = {
  createSale,
  getSales,
  getSaleById,
};