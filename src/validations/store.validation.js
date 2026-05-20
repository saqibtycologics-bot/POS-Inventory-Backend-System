const { z } = require('zod');
const { idParamSchema, paginationQuerySchema } = require('./common.validation');

const createStoreSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Store name must be at least 2 characters long')
    .max(100, 'Store name cannot exceed 100 characters'),

  phone: z
    .string()
    .trim()
    .max(30, 'Phone number cannot exceed 30 characters')
    .optional(),

  address: z
    .string()
    .trim()
    .max(300, 'Address cannot exceed 300 characters')
    .optional(),
}).strict();

const updateStoreSchema = createStoreSchema.partial().strict();

const storeQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().optional(),
});

module.exports = {
  createStoreSchema,
  updateStoreSchema,
  storeQuerySchema,
  storeIdParamSchema: idParamSchema,
};