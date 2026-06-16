const { mongoose } = require('../config/db');

const Product = require('../models/product.model');
const Variant = require('../models/variant.model');
const Store = require('../models/store.model');
const Category = require('../models/category.model');

const { getErrorResponse } = require('../utils/errorCodes');

/**
 * Confirm that a store exists, is active,
 * and belongs to the logged-in user's company.
 */
const ensureValidStore = async (storeId, companyId) => {
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
 * Confirm that a category exists, is active,
 * belongs to the logged-in user's company,
 * and belongs to the selected store.
 */
const ensureValidCategory = async (categoryId, storeId, companyId) => {
  const category = await Category.findOne({
    _id: categoryId,
    storeId,
    companyId,
    isActive: true,
  });

  if (!category) {
    throw getErrorResponse('CATEGORY_NOT_FOUND');
  }

  return category;
};

/**
 * Create a product with its initial variants.
 *
 * Flow:
 * 1. Validate store ownership
 * 2. Validate category ownership and store relation
 * 3. Check duplicate product name inside same store
 * 4. Check duplicate SKUs inside current request
 * 5. Check whether any SKU already exists in database
 * 6. Create Product
 * 7. Create Variant records
 * 8. Return product + variants
 */
const createProduct = async (payload, userContext) => {
  const {
    storeId,
    categoryId,
    name,
    description,
    basePrice,
    variants,
  } = payload;

  const { userId, companyId } = userContext;

  await ensureValidStore(storeId, companyId);
  await ensureValidCategory(categoryId, storeId, companyId);

  const existingProduct = await Product.findOne({
    storeId,
    companyId,
    name,
    isActive: true,
  });

  if (existingProduct) {
    throw getErrorResponse('PRODUCT_ALREADY_EXISTS');
  }

  /**
   * Prevent duplicate SKU values in the same request body.
   */
  const normalizedSkus = variants.map((variant) =>
    variant.sku.trim().toUpperCase()
  );

  const uniqueSkuCount = new Set(normalizedSkus).size;

  if (uniqueSkuCount !== normalizedSkus.length) {
    throw getErrorResponse('VARIANT_ALREADY_EXISTS', {
      details: 'Duplicate SKU found inside product variants.',
    });
  }

  /**
   * SKU is globally unique in our Variant model.
   * So we also check whether any supplied SKU already exists in DB.
   */
  const existingVariant = await Variant.findOne({
    sku: { $in: normalizedSkus },
  });

  if (existingVariant) {
    throw getErrorResponse('VARIANT_ALREADY_EXISTS', {
      details: `SKU ${existingVariant.sku} already exists.`,
    });
  }

  const variantPayloads = variants.map((variant) => ({
    name: variant.name,
    sku: variant.sku.trim().toUpperCase(),
    price: variant.price,
    costPrice: variant.costPrice,
    stock: variant.stock ?? 0,
    lowStockThreshold: variant.lowStockThreshold ?? 5,
    attributes: variant.attributes || {},
    storeId,
    companyId,
    createdBy: userId,
    isDefault: variants.length === 1,
  }));

  const session = await mongoose.startSession();
  let result;

  try {
    await session.withTransaction(async () => {
      const [product] = await Product.create(
        [
          {
            name,
            description,
            basePrice,
            categoryId,
            storeId,
            companyId,
            createdBy: userId,
            hasVariants: variants.length > 1,
          },
        ],
        { session }
      );

      const variantsWithProductId = variantPayloads.map((variant) => ({
        ...variant,
        productId: product._id,
      }));

      const createdVariants = await Variant.insertMany(variantsWithProductId, {
        session,
      });

      result = {
        product,
        variants: createdVariants,
      };
    });

    return result;
  } finally {
    await session.endSession();
  }
};

/**
 * Get all active products for logged-in user's company.
 *
 * Supports:
 * - Pagination
 * - Search by product name
 * - Filter by storeId
 * - Filter by categoryId
 */
const getProducts = async (
  { page, limit, storeId, categoryId, search },
  userContext
) => {
  const { companyId } = userContext;

  const query = {
    companyId,
    isActive: true,
  };

  /**
   * If store filter is provided,
   * confirm store belongs to current user's company.
   */
  if (storeId) {
    await ensureValidStore(storeId, companyId);
    query.storeId = storeId;
  }

  /**
   * If category filter is provided:
   * - If storeId exists, category must belong to that store
   * - Otherwise, category must simply belong to this company
   */
  if (categoryId) {
    const categoryQuery = {
      _id: categoryId,
      companyId,
      isActive: true,
    };

    if (storeId) {
      categoryQuery.storeId = storeId;
    }

    const category = await Category.findOne(categoryQuery);

    if (!category) {
      throw getErrorResponse('CATEGORY_NOT_FOUND');
    }

    query.categoryId = categoryId;
  }

  if (search) {
    query.name = {
      $regex: search,
      $options: 'i',
    };
  }

  const skip = (page - 1) * limit;

  const [products, totalProducts] = await Promise.all([
    Product.find(query)
      .populate('storeId', 'name')
      .populate('categoryId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    Product.countDocuments(query),
  ]);

  const totalPages = Math.ceil(totalProducts / limit);

  return {
    products,
    pagination: {
      total: totalProducts,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
};

/**
 * Get a single product with all active variants.
 */
const getProductById = async (productId, userContext) => {
  const { companyId } = userContext;

  const product = await Product.findOne({
    _id: productId,
    companyId,
    isActive: true,
  })
    .populate('storeId', 'name')
    .populate('categoryId', 'name');

  if (!product) {
    throw getErrorResponse('PRODUCT_NOT_FOUND');
  }

  const variants = await Variant.find({
    productId,
    companyId,
    isActive: true,
  }).sort({ createdAt: 1 });

  return {
    product,
    variants,
  };
};

/**
 * Update product-level fields only.
 *
 * Not updated here:
 * - storeId
 * - categoryId
 * - variants
 *
 * Variants get separate APIs later.
 */
const updateProduct = async (
  productId,
  updatePayload,
  userContext
) => {
  const { companyId } = userContext;

  const product = await Product.findOne({
    _id: productId,
    companyId,
    isActive: true,
  });

  if (!product) {
    throw getErrorResponse('PRODUCT_NOT_FOUND');
  }

  /**
   * Check duplicate product name inside same store.
   */
  if (updatePayload.name && updatePayload.name !== product.name) {
    const duplicateProduct = await Product.findOne({
      _id: { $ne: productId },
      storeId: product.storeId,
      companyId,
      name: updatePayload.name,
      isActive: true,
    });

    if (duplicateProduct) {
      throw getErrorResponse('PRODUCT_ALREADY_EXISTS');
    }
  }

  if (updatePayload.name !== undefined) {
    product.name = updatePayload.name;
  }

  if (updatePayload.description !== undefined) {
    product.description = updatePayload.description;
  }

  if (updatePayload.basePrice !== undefined) {
    product.basePrice = updatePayload.basePrice;
  }

  await product.save();

  return product;
};

/**
 * Soft delete product and its active variants.
 *
 * Why soft delete?
 * Future sale/report history must remain meaningful.
 */
const deleteProduct = async (productId, userContext) => {
  const { companyId } = userContext;

  const product = await Product.findOne({
    _id: productId,
    companyId,
    isActive: true,
  });

  if (!product) {
    throw getErrorResponse('PRODUCT_NOT_FOUND');
  }

  product.isActive = false;
  await product.save();

  await Variant.updateMany(
    {
      productId,
      companyId,
      isActive: true,
    },
    {
      $set: {
        isActive: false,
      },
    }
  );

  return true;
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};