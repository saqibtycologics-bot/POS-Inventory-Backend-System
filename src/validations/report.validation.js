const { z } = require('zod');
const {
  mongoIdSchema,
} = require('./common.validation');

/**
 * Shared date-range query validation for reports.
 *
 * Supports:
 * - startDate
 * - endDate
 * - optional storeId
 *
 * Example:
 * GET /api/reports/sales?startDate=2026-05-01&endDate=2026-05-19&storeId=...
 */
const reportDateRangeQuerySchema = z
  .object({
    storeId: mongoIdSchema.optional(),

    startDate: z.coerce.date().optional(),

    endDate: z.coerce.date().optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.startDate && data.endDate && data.startDate > data.endDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['startDate'],
        message: 'startDate must be before or equal to endDate.',
      });
    }
  });

/**
 * Sales report query
 *
 * GET /api/reports/sales
 */
const salesReportQuerySchema = reportDateRangeQuerySchema;

/**
 * Stock value report query
 *
 * GET /api/reports/stock-value
 *
 * Only storeId is needed here.
 * Date range is not necessary because this report shows
 * the current inventory value snapshot.
 */
const stockValueReportQuerySchema = z
  .object({
    storeId: mongoIdSchema.optional(),
  })
  .strict();

/**
 * Low stock report query
 *
 * GET /api/reports/low-stock
 *
 * Optional:
 * - storeId
 */
const lowStockReportQuerySchema = z
  .object({
    storeId: mongoIdSchema.optional(),
  })
  .strict();

module.exports = {
  salesReportQuerySchema,
  stockValueReportQuerySchema,
  lowStockReportQuerySchema,
};