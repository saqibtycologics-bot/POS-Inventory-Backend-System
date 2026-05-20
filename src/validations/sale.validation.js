const { z } = require('zod');
const {
  mongoIdSchema,
  idParamSchema,
  paginationQuerySchema,
} = require('./common.validation');

/**
 * Single sale item input schema
 *
 * Client only sends:
 * - variantId
 * - quantity
 *
 * Price, cost price, subtotal, productId, and stock deduction
 * will be calculated securely inside sale.service.js.
 */
const saleItemInputSchema = z
  .object({
    variantId: mongoIdSchema,

    quantity: z
      .number()
      .int('Quantity must be a whole number')
      .positive('Quantity must be greater than zero'),
  })
  .strict();

/**
 * Create Sale Schema
 *
 * POST /api/sales
 */
const createSaleSchema = z
  .object({
    storeId: mongoIdSchema,

    items: z
      .array(saleItemInputSchema)
      .min(1, 'At least one sale item is required'),

    note: z
      .string()
      .trim()
      .max(300, 'Note cannot exceed 300 characters')
      .optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    /**
     * Prevent duplicate variantId entries in one sale request.
     *
     * Bad:
     * items: [
     *   { variantId: "A", quantity: 2 },
     *   { variantId: "A", quantity: 3 }
     * ]
     *
     * The client should send:
     * items: [
     *   { variantId: "A", quantity: 5 }
     * ]
     */
    const variantIds = data.items.map((item) => item.variantId);
    const uniqueVariantIds = new Set(variantIds);

    if (uniqueVariantIds.size !== variantIds.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['items'],
        message: 'Duplicate variants are not allowed in the same sale.',
      });
    }
  });

/**
 * Sales List Query Schema
 *
 * GET /api/sales
 *
 * Supports:
 * - page
 * - limit
 * - storeId
 * - startDate
 * - endDate
 */
const saleQuerySchema = paginationQuerySchema
  .extend({
    storeId: mongoIdSchema.optional(),

    startDate: z.coerce.date().optional(),

    endDate: z.coerce.date().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.startDate && data.endDate && data.startDate > data.endDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['startDate'],
        message: 'startDate must be before or equal to endDate.',
      });
    }
  });

module.exports = {
  saleItemInputSchema,
  createSaleSchema,
  saleQuerySchema,
  saleIdParamSchema: idParamSchema,
};