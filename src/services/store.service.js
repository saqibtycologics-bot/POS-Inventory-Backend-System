const Store = require('../models/store.model');
const { getErrorResponse } = require('../utils/errorCodes');

/**
 * Create a new store for the logged-in user's company.
 *
 * Flow:
 * 1. Check whether another active store with the same name already exists
 *    in this company.
 * 2. Create store with:
 *    - req.user.companyId
 *    - req.user.userId as createdBy
 * 3. Return created store.
 */
const createStore = async ({ name, phone, address }, userContext) => {
  const { userId, companyId } = userContext;

  const existingStore = await Store.findOne({
    companyId,
    name,
    isActive: true,
  });

  if (existingStore) {
    throw getErrorResponse('STORE_ALREADY_EXISTS');
  }

  const store = await Store.create({
    name,
    phone,
    address,
    companyId,
    createdBy: userId,
  });

  return store;
};

/**
 * Get all active stores for the logged-in user's company.
 *
 * Supports:
 * - Pagination
 * - Search by store name
 */
const getStores = async ({ page, limit, search }, userContext) => {
  const { companyId } = userContext;

  const query = {
    companyId,
    isActive: true,
  };

  if (search) {
    query.name = {
      $regex: search,
      $options: 'i',
    };
  }

  const skip = (page - 1) * limit;

  const [stores, totalStores] = await Promise.all([
    Store.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    Store.countDocuments(query),
  ]);

  const totalPages = Math.ceil(totalStores / limit);

  return {
    stores,
    pagination: {
      total: totalStores,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
};

/**
 * Get a single active store by ID.
 *
 * Security:
 * The store must belong to the logged-in user's company.
 */
const getStoreById = async (storeId, userContext) => {
  const { companyId } = userContext;

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
 * Update a store.
 *
 * Flow:
 * 1. Find store by ID + company ownership.
 * 2. If name is being changed, check duplicate name in same company.
 * 3. Update provided fields only.
 * 4. Return updated store.
 */
const updateStore = async (storeId, updatePayload, userContext) => {
  const { companyId } = userContext;

  const store = await Store.findOne({
    _id: storeId,
    companyId,
    isActive: true,
  });

  if (!store) {
    throw getErrorResponse('STORE_NOT_FOUND');
  }

  if (updatePayload.name && updatePayload.name !== store.name) {
    const duplicateStore = await Store.findOne({
      _id: { $ne: storeId },
      companyId,
      name: updatePayload.name,
      isActive: true,
    });

    if (duplicateStore) {
      throw getErrorResponse('STORE_ALREADY_EXISTS');
    }
  }

  if (updatePayload.name !== undefined) {
    store.name = updatePayload.name;
  }

  if (updatePayload.phone !== undefined) {
    store.phone = updatePayload.phone;
  }

  if (updatePayload.address !== undefined) {
    store.address = updatePayload.address;
  }

  await store.save();

  return store;
};

/**
 * Soft delete a store.
 *
 * Instead of removing the document permanently:
 * - isActive is set to false
 *
 * Why?
 * In a POS/inventory system, stores may later be linked to:
 * - Categories
 * - Products
 * - Stock movements
 * - Sales records
 *
 * Hard deleting them can break historical reporting.
 */
const deleteStore = async (storeId, userContext) => {
  const { companyId } = userContext;

  const store = await Store.findOne({
    _id: storeId,
    companyId,
    isActive: true,
  });

  if (!store) {
    throw getErrorResponse('STORE_NOT_FOUND');
  }

  store.isActive = false;
  await store.save();

  return true;
};

module.exports = {
  createStore,
  getStores,
  getStoreById,
  updateStore,
  deleteStore,
};