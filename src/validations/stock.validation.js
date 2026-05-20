const { z } = require('zod');
const {
  mongoIdSchema,
  paginationQuerySchema,
} = require('./common.validation');

/**
 * Shared schema for stock quantity changes.
 *
 * Used by:
 * - Add stock
 * - Remove stock
 */
const stockQuantityOperationSchema = z
  .object({
    variantId: mongoIdSchema,

    quantity: z
      .number()
      .int('Quantity must be a whole number')
      .positive('Quantity must be greater than zero'),

    note: z
      .string()
      .trim()
      .max(300, 'Note cannot exceed 300 characters')
      .optional(),
  })
  .strict();

/**
 * Add stock schema
 *
 * POST /api/stock/add
 */
const addStockSchema = stockQuantityOperationSchema;

/**
 * Remove stock schema
 *
 * POST /api/stock/remove
 */
const removeStockSchema = stockQuantityOperationSchema;

/**
 * Stock history params schema
 *
 * GET /api/stock/history/:variantId
 */
const stockHistoryParamSchema = z
  .object({
    variantId: mongoIdSchema,
  })
  .strict();

/**
 * Stock history query schema
 *
 * Supports pagination:
 * ?page=1&limit=10
 */
const stockHistoryQuerySchema = paginationQuerySchema;

module.exports = {
  addStockSchema,
  removeStockSchema,
  stockHistoryParamSchema,
  stockHistoryQuerySchema,
};