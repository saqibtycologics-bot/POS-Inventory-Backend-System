const { z } = require('zod');
const {
  mongoIdSchema,
  idParamSchema,
  paginationQuerySchema,
} = require('./common.validation');

/**
 * Variant input schema used while creating a product.
 *
 * Every product must have at least one variant.
 * - Simple product: one default variant
 * - Complex product: multiple variants
 */
const variantInputSchema = z
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
      .number({
        required_error: 'Variant price is required',
        invalid_type_error: 'Variant price must be a number',
      })
      .nonnegative('Variant price cannot be negative'),

    /**
     * Required for:
     * - Stock value report
     * - Future profit/margin reports
     */
    costPrice: z
      .number({
        required_error: 'Cost price is required',
        invalid_type_error: 'Cost price must be a number',
      })
      .nonnegative('Cost price cannot be negative'),

    stock: z
      .number({
        invalid_type_error: 'Stock must be a number',
      })
      .int('Stock must be a whole number')
      .nonnegative('Stock cannot be negative')
      .default(0),

    /**
     * Used later in low-stock report.
     */
    lowStockThreshold: z
      .number({
        invalid_type_error: 'Low stock threshold must be a number',
      })
      .int('Low stock threshold must be a whole number')
      .nonnegative('Low stock threshold cannot be negative')
      .default(5),

    attributes: z
      .record(z.string(), z.string())
      .optional(),
  })
  .strict();

/**
 * Create Product Schema
 */
const createProductSchema = z
  .object({
    storeId: mongoIdSchema,
    categoryId: mongoIdSchema,

    name: z
      .string()
      .trim()
      .min(2, 'Product name must be at least 2 characters long')
      .max(150, 'Product name cannot exceed 150 characters'),

    description: z
      .string()
      .trim()
      .max(500, 'Description cannot exceed 500 characters')
      .optional(),

    basePrice: z
      .number({
        required_error: 'Base price is required',
        invalid_type_error: 'Base price must be a number',
      })
      .nonnegative('Base price cannot be negative'),

    variants: z
      .array(variantInputSchema)
      .min(1, 'At least one variant is required'),
  })
  .strict();

/**
 * Product update does not update:
 * - storeId
 * - categoryId
 * - variants
 *
 * Variants will have separate APIs later.
 */
const updateProductSchema = createProductSchema
  .omit({
    storeId: true,
    categoryId: true,
    variants: true,
  })
  .partial()
  .strict();

/**
 * Query validation for product list endpoint.
 */
const productQuerySchema = paginationQuerySchema.extend({
  storeId: mongoIdSchema.optional(),
  categoryId: mongoIdSchema.optional(),
  search: z.string().trim().optional(),
});

module.exports = {
  variantInputSchema,
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
  productIdParamSchema: idParamSchema,
};