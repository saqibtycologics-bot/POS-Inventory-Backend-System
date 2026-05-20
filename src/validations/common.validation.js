const { z } = require('zod');

/**
 * Reusable MongoDB ObjectId validator
 */
const mongoIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId format');

/**
 * Common route param schema:
 * /:id
 */
const idParamSchema = z.object({
  id: mongoIdSchema,
});

/**
 * Common pagination query schema
 *
 * Query values come as strings:
 * ?page=1&limit=10
 *
 * z.coerce.number() converts "1" to 1.
 */
const paginationQuerySchema = z.object({
  page: z
    .preprocess(
      (value) => Number(value || 1),
      z.number().int().positive().default(1)
    ),

  limit: z
    .preprocess(
      (value) => Number(value || 10),
      z.number().int().positive().max(100).default(10)
    ),
});
/**
 * Optional date range query schema:
 * ?startDate=2026-05-01&endDate=2026-05-18
 */
const dateRangeQuerySchema = z
  .object({
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return data.startDate <= data.endDate;
      }

      return true;
    },
    {
      message: 'startDate must be before or equal to endDate',
      path: ['startDate'],
    }
  );

module.exports = {
  mongoIdSchema,
  idParamSchema,
  paginationQuerySchema,
  dateRangeQuerySchema,
};