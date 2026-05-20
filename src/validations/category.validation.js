const { z } = require('zod');
const {
  mongoIdSchema,
  idParamSchema,
  paginationQuerySchema,
} = require('./common.validation');

const createCategorySchema = z.object({
  storeId: mongoIdSchema,

  name: z
    .string()
    .trim()
    .min(2, 'Category name must be at least 2 characters long')
    .max(100, 'Category name cannot exceed 100 characters'),

  description: z
    .string()
    .trim()
    .max(300, 'Description cannot exceed 300 characters')
    .optional(),
}).strict();

const updateCategorySchema = createCategorySchema
  .omit({
    storeId: true,
  })
  .partial()
  .strict();

const categoryQuerySchema = paginationQuerySchema.extend({
  storeId: mongoIdSchema.optional(),
  search: z.string().trim().optional(),
});

module.exports = {
  createCategorySchema,
  updateCategorySchema,
  categoryQuerySchema,
  categoryIdParamSchema: idParamSchema,
};