/**
 * Centralized error and success codes
 * for Mini POS Inventory Backend.
 *
 * Purpose:
 * - Keep API messages consistent across the app
 * - Avoid hardcoded messages in controllers/services
 * - Make frontend integration predictable
 * - Keep status codes, codes, and messages in one place
 */

/* -------------------------------------------------------------------------- */
/*                                ERROR CODES                                 */
/* -------------------------------------------------------------------------- */

const ERROR_CODES = {
  // ──────────────────────────────────────────────────────────────────────────
  // Generic / System Errors
  // ──────────────────────────────────────────────────────────────────────────
  INTERNAL_SERVER_ERROR: {
    status: 500,
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Something went wrong. Please try again later.',
  },

  ROUTE_NOT_FOUND: {
    status: 404,
    code: 'ROUTE_NOT_FOUND',
    message: 'The requested route was not found.',
  },

  VALIDATION_ERROR: {
    status: 422,
    code: 'VALIDATION_ERROR',
    message: 'Validation failed. Please check the provided data.',
  },

  TOO_MANY_REQUESTS: {
    status: 429,
    code: 'TOO_MANY_REQUESTS',
    message: 'Too many requests. Please try again later.',
  },

  INVALID_ID_FORMAT: {
    status: 400,
    code: 'INVALID_ID_FORMAT',
    message: 'Invalid resource ID format.',
  },

  RESOURCE_ALREADY_EXISTS: {
    status: 409,
    code: 'RESOURCE_ALREADY_EXISTS',
    message: 'This resource already exists.',
  },

  RESOURCE_NOT_FOUND: {
    status: 404,
    code: 'RESOURCE_NOT_FOUND',
    message: 'The requested resource was not found.',
  },

  // ──────────────────────────────────────────────────────────────────────────
  // Authentication / Authorization Errors
  // ──────────────────────────────────────────────────────────────────────────
  USER_ALREADY_EXISTS: {
    status: 409,
    code: 'USER_ALREADY_EXISTS',
    message: 'A user with this email already exists.',
  },

  USER_NOT_FOUND: {
    status: 404,
    code: 'USER_NOT_FOUND',
    message: 'User not found.',
  },

  INVALID_CREDENTIALS: {
    status: 401,
    code: 'INVALID_CREDENTIALS',
    message: 'Invalid email or password.',
  },

  UNAUTHORIZED_ACCESS: {
    status: 401,
    code: 'UNAUTHORIZED_ACCESS',
    message: 'Authentication is required to access this resource.',
  },

  FORBIDDEN_ACCESS: {
    status: 403,
    code: 'FORBIDDEN_ACCESS',
    message: 'You do not have permission to perform this action.',
  },

  ACCESS_TOKEN_MISSING: {
    status: 401,
    code: 'ACCESS_TOKEN_MISSING',
    message: 'Access token is missing.',
  },

  ACCESS_TOKEN_INVALID: {
    status: 401,
    code: 'ACCESS_TOKEN_INVALID',
    message: 'Access token is invalid.',
  },

  ACCESS_TOKEN_EXPIRED: {
    status: 401,
    code: 'ACCESS_TOKEN_EXPIRED',
    message: 'Access token has expired.',
  },

  REFRESH_TOKEN_MISSING: {
    status: 401,
    code: 'REFRESH_TOKEN_MISSING',
    message: 'Refresh token is missing.',
  },

  REFRESH_TOKEN_INVALID: {
    status: 401,
    code: 'REFRESH_TOKEN_INVALID',
    message: 'Refresh token is invalid.',
  },

  REFRESH_TOKEN_EXPIRED: {
    status: 401,
    code: 'REFRESH_TOKEN_EXPIRED',
    message: 'Refresh token has expired.',
  },

  REFRESH_TOKEN_REVOKED: {
    status: 401,
    code: 'REFRESH_TOKEN_REVOKED',
    message: 'Refresh token has been revoked. Please log in again.',
  },

  // ──────────────────────────────────────────────────────────────────────────
  // Company Errors
  // ──────────────────────────────────────────────────────────────────────────
  COMPANY_NOT_FOUND: {
    status: 404,
    code: 'COMPANY_NOT_FOUND',
    message: 'Company not found.',
  },

  COMPANY_ALREADY_EXISTS: {
    status: 409,
    code: 'COMPANY_ALREADY_EXISTS',
    message: 'Company already exists.',
  },

  // ──────────────────────────────────────────────────────────────────────────
  // Store Errors
  // ──────────────────────────────────────────────────────────────────────────
  STORE_NOT_FOUND: {
    status: 404,
    code: 'STORE_NOT_FOUND',
    message: 'Store not found.',
  },

  STORE_ALREADY_EXISTS: {
    status: 409,
    code: 'STORE_ALREADY_EXISTS',
    message: 'A store with this name already exists.',
  },

  STORE_ACCESS_DENIED: {
    status: 403,
    code: 'STORE_ACCESS_DENIED',
    message: 'You do not have access to this store.',
  },

  // ──────────────────────────────────────────────────────────────────────────
  // Category Errors
  // ──────────────────────────────────────────────────────────────────────────
  CATEGORY_NOT_FOUND: {
    status: 404,
    code: 'CATEGORY_NOT_FOUND',
    message: 'Category not found.',
  },

  CATEGORY_ALREADY_EXISTS: {
    status: 409,
    code: 'CATEGORY_ALREADY_EXISTS',
    message: 'A category with this name already exists in this store.',
  },

  CATEGORY_HAS_PRODUCTS: {
    status: 409,
    code: 'CATEGORY_HAS_PRODUCTS',
    message: 'This category cannot be deleted because products are linked to it.',
  },

  // ──────────────────────────────────────────────────────────────────────────
  // Product Errors
  // ──────────────────────────────────────────────────────────────────────────
  PRODUCT_NOT_FOUND: {
    status: 404,
    code: 'PRODUCT_NOT_FOUND',
    message: 'Product not found.',
  },

  PRODUCT_ALREADY_EXISTS: {
    status: 409,
    code: 'PRODUCT_ALREADY_EXISTS',
    message: 'A product with this name already exists in this store.',
  },

  PRODUCT_HAS_VARIANTS: {
    status: 409,
    code: 'PRODUCT_HAS_VARIANTS',
    message: 'This product has variants and cannot be processed as a simple product.',
  },

  // ──────────────────────────────────────────────────────────────────────────
  // Variant Errors
  // ──────────────────────────────────────────────────────────────────────────
  VARIANT_NOT_FOUND: {
    status: 404,
    code: 'VARIANT_NOT_FOUND',
    message: 'Product variant not found.',
  },

  VARIANT_ALREADY_EXISTS: {
    status: 409,
    code: 'VARIANT_ALREADY_EXISTS',
    message: 'A variant with this SKU already exists.',
  },

  DEFAULT_VARIANT_REQUIRED: {
    status: 400,
    code: 'DEFAULT_VARIANT_REQUIRED',
    message: 'A product must have at least one default variant.',
  },

  // ──────────────────────────────────────────────────────────────────────────
  // Stock Errors
  // ──────────────────────────────────────────────────────────────────────────
  INVALID_STOCK_QUANTITY: {
    status: 400,
    code: 'INVALID_STOCK_QUANTITY',
    message: 'Stock quantity must be greater than zero.',
  },

  INSUFFICIENT_STOCK: {
    status: 409,
    code: 'INSUFFICIENT_STOCK',
    message: 'Insufficient stock available for this operation.',
  },

  STOCK_MOVEMENT_NOT_FOUND: {
    status: 404,
    code: 'STOCK_MOVEMENT_NOT_FOUND',
    message: 'Stock movement record not found.',
  },

  // ──────────────────────────────────────────────────────────────────────────
  // Sales Errors
  // ──────────────────────────────────────────────────────────────────────────
  SALE_NOT_FOUND: {
    status: 404,
    code: 'SALE_NOT_FOUND',
    message: 'Sale record not found.',
  },

  SALE_ITEMS_REQUIRED: {
    status: 400,
    code: 'SALE_ITEMS_REQUIRED',
    message: 'At least one sale item is required.',
  },

  INVALID_SALE_ITEM: {
    status: 400,
    code: 'INVALID_SALE_ITEM',
    message: 'One or more sale items are invalid.',
  },

  // ──────────────────────────────────────────────────────────────────────────
  // Reports Errors
  // ──────────────────────────────────────────────────────────────────────────
  INVALID_DATE_RANGE: {
    status: 400,
    code: 'INVALID_DATE_RANGE',
    message: 'Invalid date range provided.',
  },
};

/* -------------------------------------------------------------------------- */
/*                               SUCCESS CODES                                */
/* -------------------------------------------------------------------------- */

const SUCCESS_CODES = {
  // Generic
  REQUEST_SUCCESSFUL: {
    status: 200,
    code: 'REQUEST_SUCCESSFUL',
    message: 'Request completed successfully.',
  },

  // Auth
  USER_REGISTERED: {
    status: 201,
    code: 'USER_REGISTERED',
    message: 'User registered successfully.',
  },

  LOGIN_SUCCESS: {
    status: 200,
    code: 'LOGIN_SUCCESS',
    message: 'Login successful.',
  },

  TOKEN_REFRESHED: {
    status: 200,
    code: 'TOKEN_REFRESHED',
    message: 'Access token refreshed successfully.',
  },

  LOGOUT_SUCCESS: {
    status: 200,
    code: 'LOGOUT_SUCCESS',
    message: 'Logout successful.',
  },

  PROFILE_FETCHED: {
    status: 200,
    code: 'PROFILE_FETCHED',
    message: 'Profile fetched successfully.',
  },

  // Store
  STORE_CREATED: {
    status: 201,
    code: 'STORE_CREATED',
    message: 'Store created successfully.',
  },

  STORES_FETCHED: {
    status: 200,
    code: 'STORES_FETCHED',
    message: 'Stores fetched successfully.',
  },

  STORE_FETCHED: {
    status: 200,
    code: 'STORE_FETCHED',
    message: 'Store fetched successfully.',
  },

  STORE_UPDATED: {
    status: 200,
    code: 'STORE_UPDATED',
    message: 'Store updated successfully.',
  },

  STORE_DELETED: {
    status: 200,
    code: 'STORE_DELETED',
    message: 'Store deleted successfully.',
  },

  // Category
  CATEGORY_CREATED: {
    status: 201,
    code: 'CATEGORY_CREATED',
    message: 'Category created successfully.',
  },

  CATEGORIES_FETCHED: {
    status: 200,
    code: 'CATEGORIES_FETCHED',
    message: 'Categories fetched successfully.',
  },

  CATEGORY_FETCHED: {
    status: 200,
    code: 'CATEGORY_FETCHED',
    message: 'Category fetched successfully.',
  },

  CATEGORY_UPDATED: {
    status: 200,
    code: 'CATEGORY_UPDATED',
    message: 'Category updated successfully.',
  },

  CATEGORY_DELETED: {
    status: 200,
    code: 'CATEGORY_DELETED',
    message: 'Category deleted successfully.',
  },

  // Product
  PRODUCT_CREATED: {
    status: 201,
    code: 'PRODUCT_CREATED',
    message: 'Product created successfully.',
  },

  PRODUCTS_FETCHED: {
    status: 200,
    code: 'PRODUCTS_FETCHED',
    message: 'Products fetched successfully.',
  },

  PRODUCT_FETCHED: {
    status: 200,
    code: 'PRODUCT_FETCHED',
    message: 'Product fetched successfully.',
  },

  PRODUCT_UPDATED: {
    status: 200,
    code: 'PRODUCT_UPDATED',
    message: 'Product updated successfully.',
  },

  PRODUCT_DELETED: {
    status: 200,
    code: 'PRODUCT_DELETED',
    message: 'Product deleted successfully.',
  },

  // Variant
  VARIANT_CREATED: {
    status: 201,
    code: 'VARIANT_CREATED',
    message: 'Product variant created successfully.',
  },

  VARIANT_UPDATED: {
    status: 200,
    code: 'VARIANT_UPDATED',
    message: 'Product variant updated successfully.',
  },

  VARIANT_DELETED: {
    status: 200,
    code: 'VARIANT_DELETED',
    message: 'Product variant deleted successfully.',
  },

  // Stock
  STOCK_ADDED: {
    status: 200,
    code: 'STOCK_ADDED',
    message: 'Stock added successfully.',
  },

  STOCK_REMOVED: {
    status: 200,
    code: 'STOCK_REMOVED',
    message: 'Stock removed successfully.',
  },

  STOCK_HISTORY_FETCHED: {
    status: 200,
    code: 'STOCK_HISTORY_FETCHED',
    message: 'Stock history fetched successfully.',
  },

  // Sales
  SALE_CREATED: {
    status: 201,
    code: 'SALE_CREATED',
    message: 'Sale created successfully.',
  },

  SALES_FETCHED: {
    status: 200,
    code: 'SALES_FETCHED',
    message: 'Sales fetched successfully.',
  },

  SALE_FETCHED: {
    status: 200,
    code: 'SALE_FETCHED',
    message: 'Sale fetched successfully.',
  },

  // Reports
  SALES_REPORT_FETCHED: {
    status: 200,
    code: 'SALES_REPORT_FETCHED',
    message: 'Sales report fetched successfully.',
  },

  STOCK_VALUE_REPORT_FETCHED: {
    status: 200,
    code: 'STOCK_VALUE_REPORT_FETCHED',
    message: 'Stock value report fetched successfully.',
  },

  LOW_STOCK_REPORT_FETCHED: {
    status: 200,
    code: 'LOW_STOCK_REPORT_FETCHED',
    message: 'Low stock report fetched successfully.',
  },
};

/* -------------------------------------------------------------------------- */
/*                              RESPONSE HELPERS                              */
/* -------------------------------------------------------------------------- */

/**
 * Build consistent error response
 *
 * @param {string} errorKey - Key from ERROR_CODES
 * @param {object} extraData - Optional extra details/errors
 * @returns {object}
 */
const getErrorResponse = (errorKey, extraData = {}) => {
  const selectedError =
    ERROR_CODES[errorKey] || ERROR_CODES.INTERNAL_SERVER_ERROR;

  return {
    status: selectedError.status,
    success: false,
    code: selectedError.code,
    message: selectedError.message,
    ...extraData,
  };
};

/**
 * Build consistent success response
 *
 * @param {string} successKey - Key from SUCCESS_CODES
 * @param {object} data - Optional response data
 * @returns {object}
 */
const getSuccessResponse = (successKey, data = {}) => {
  const selectedSuccess =
    SUCCESS_CODES[successKey] || SUCCESS_CODES.REQUEST_SUCCESSFUL;

  return {
    status: selectedSuccess.status,
    success: true,
    code: selectedSuccess.code,
    message: selectedSuccess.message,
    data,
  };
};

module.exports = {
  ERROR_CODES,
  SUCCESS_CODES,
  getErrorResponse,
  getSuccessResponse,
};