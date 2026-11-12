import { z } from "zod";

const stockAdjustmentSchema = z.object({
  quantity: z.coerce
    .number()
    .int("Quantity must be a whole number.")
    .positive("Quantity must be greater than zero."),

  movementType: z.enum(["stock_in", "stock_out"]),
  reason: z.string().trim().max(500).optional().default(""),
});

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).default(10),
});

export { stockAdjustmentSchema, paginationSchema };
