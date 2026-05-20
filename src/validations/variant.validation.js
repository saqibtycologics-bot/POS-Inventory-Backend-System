const { z } = require('zod');
const { idParamSchema } = require('./common.validation');

/**
 * Schema for adding a new variant
 * to an already-existing product.
 *
 * Stock can be provided only while initially creating the variant.
 * Later stock changes must happen through Stock Module APIs.
 */
const createVariantSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Variant name is required')
      .max(100, 'Variant name cannot exceed 100 characters'),

    sku: z
      .string()
      .trim()
      .min(1, 'SKU is required')
      .max(80, 'SKU cannot exceed 80 characters'),

    price: z
      .number()
      .nonnegative('Variant price cannot be negative'),

    costPrice: z
      .number()
      .nonnegative('Cost price cannot be negative'),

    stock: z
      .number()
      .int('Stock must be a whole number')
      .nonnegative('Stock cannot be negative')
      .default(0),

    lowStockThreshold: z
      .number()
      .int('Low stock threshold must be a whole number')
      .nonnegative('Low stock threshold cannot be negative')
      .default(5),

    attributes: z
      .record(z.string(), z.string())
      .optional(),
  })
  .strict();

/**
 * Variant update schema
 *
 * Important:
 * - Stock is intentionally NOT updateable here.
 * - Stock should only be managed from:
 *   POST /api/stock/add
 *   POST /api/stock/remove
 *
 * This protects inventory history and reporting accuracy.
 */
const updateVariantSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Variant name is required')
      .max(100, 'Variant name cannot exceed 100 characters')
      .optional(),

    sku: z
      .string()
      .trim()
      .min(1, 'SKU is required')
      .max(80, 'SKU cannot exceed 80 characters')
      .optional(),

    price: z
      .number()
      .nonnegative('Variant price cannot be negative')
      .optional(),

    costPrice: z
      .number()
      .nonnegative('Cost price cannot be negative')
      .optional(),

    lowStockThreshold: z
      .number()
      .int('Low stock threshold must be a whole number')
      .nonnegative('Low stock threshold cannot be negative')
      .optional(),

    attributes: z
      .record(z.string(), z.string())
      .optional(),
  })
  .strict()
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message: 'At least one field is required for update',
    }
  );

module.exports = {
  createVariantSchema,
  updateVariantSchema,

  /**
   * Used for:
   * POST /api/products/:id/variants
   */
  productIdParamSchema: idParamSchema,

  /**
   * Used for:
   * PUT /api/variants/:id
   * DELETE /api/variants/:id
   */
  variantIdParamSchema: idParamSchema,
};