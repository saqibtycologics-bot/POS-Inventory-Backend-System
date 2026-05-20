const mongoose = require('mongoose');
const dayjs = require('dayjs');

const Sale = require('../models/sale.model');
const Variant = require('../models/variant.model');
const Store = require('../models/store.model');

const { getErrorResponse } = require('../utils/errorCodes');

/**
 * Ensure that the provided store:
 * - exists
 * - is active
 * - belongs to the logged-in user's company
 */
const ensureValidStore = async (storeId, companyId) => {
  if (!storeId) {
    return null;
  }

  const store = await Store.findOne({
    _id: storeId,
    companyId,
    isActive: true,
  });

  if (!store) {
    throw getErrorResponse('STORE_NOT_FOUND');
  }

  return store;
};

/**
 * Total Sales Report
 *
 * GET /api/reports/sales
 *
 * Supports:
 * - company-wide report
 * - optional store filter
 * - optional date range
 *
 * Returns:
 * - total number of sales
 * - total amount of sales
 * - total quantity sold
 */
const getSalesReport = async (
  { storeId, startDate, endDate },
  userContext
) => {
  const { companyId } = userContext;

  await ensureValidStore(storeId, companyId);

  const matchStage = {
    companyId: new mongoose.Types.ObjectId(companyId),
  };

  if (storeId) {
    matchStage.storeId = new mongoose.Types.ObjectId(storeId);
  }

  if (startDate || endDate) {
    matchStage.saleDate = {};

    if (startDate) {
      matchStage.saleDate.$gte = dayjs(startDate).startOf('day').toDate();
    }

    if (endDate) {
      matchStage.saleDate.$lte = dayjs(endDate).endOf('day').toDate();
    }
  }

  const [report] = await Sale.aggregate([
    {
      $match: matchStage,
    },
    {
      $group: {
        _id: null,
        totalSalesCount: {
          $sum: 1,
        },
        totalSalesAmount: {
          $sum: '$totalAmount',
        },
        totalItemsSold: {
          $sum: '$totalItems',
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalSalesCount: 1,
        totalSalesAmount: 1,
        totalItemsSold: 1,
      },
    },
  ]);

  return {
    filters: {
      storeId: storeId || null,
      startDate: startDate || null,
      endDate: endDate || null,
    },
    summary: report || {
      totalSalesCount: 0,
      totalSalesAmount: 0,
      totalItemsSold: 0,
    },
  };
};

/**
 * Stock Value Report
 *
 * GET /api/reports/stock-value
 *
 * Current stock value is calculated as:
 * stock × costPrice
 *
 * Supports:
 * - company-wide stock report
 * - optional store filter
 */
const getStockValueReport = async ({ storeId }, userContext) => {
  const { companyId } = userContext;

  await ensureValidStore(storeId, companyId);

  const matchStage = {
    companyId: new mongoose.Types.ObjectId(companyId),
    isActive: true,
  };

  if (storeId) {
    matchStage.storeId = new mongoose.Types.ObjectId(storeId);
  }

  const [report] = await Variant.aggregate([
    {
      $match: matchStage,
    },
    {
      $project: {
        stock: 1,
        costPrice: 1,
        inventoryValue: {
          $multiply: ['$stock', '$costPrice'],
        },
      },
    },
    {
      $group: {
        _id: null,
        totalVariants: {
          $sum: 1,
        },
        totalStockUnits: {
          $sum: '$stock',
        },
        totalStockValue: {
          $sum: '$inventoryValue',
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalVariants: 1,
        totalStockUnits: 1,
        totalStockValue: 1,
      },
    },
  ]);

  return {
    filters: {
      storeId: storeId || null,
    },
    summary: report || {
      totalVariants: 0,
      totalStockUnits: 0,
      totalStockValue: 0,
    },
  };
};

/**
 * Low Stock Report
 *
 * GET /api/reports/low-stock
 *
 * A variant is considered low stock when:
 * stock <= lowStockThreshold
 *
 * Supports:
 * - company-wide report
 * - optional store filter
 */
const getLowStockReport = async ({ storeId }, userContext) => {
  const { companyId } = userContext;

  await ensureValidStore(storeId, companyId);

  const query = {
    companyId,
    isActive: true,
    $expr: {
      $lte: ['$stock', '$lowStockThreshold'],
    },
  };

  if (storeId) {
    query.storeId = storeId;
  }

  const lowStockVariants = await Variant.find(query)
    .populate('productId', 'name')
    .populate('storeId', 'name')
    .sort({
      stock: 1,
      createdAt: -1,
    });

  return {
    filters: {
      storeId: storeId || null,
    },
    totalLowStockVariants: lowStockVariants.length,
    variants: lowStockVariants,
  };
};

module.exports = {
  getSalesReport,
  getStockValueReport,
  getLowStockReport,
};