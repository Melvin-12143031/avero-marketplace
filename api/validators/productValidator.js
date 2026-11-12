import { z } from "zod";

const productSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Product name must be at least 3 characters.")
    .max(150, "Product name cannot exceed 150 characters."),

  description: z
    .string()
    .trim()
    .max(1000, "Description cannot exceed 1000 characters.")
    .optional()
    .default(""),

  price: z.coerce.number().positive("Price must be greater than zero."),

  stock_quantity: z.coerce
    .number()
    .int("Stock quantity must be a whole number.")
    .min(0, "Stock quantity cannot be negative."),

  category_id: z.string().uuid("Invalid category ID."),

  image_url: z.string().url("Invalid image URL.").optional().or(z.literal("")),

  is_active: z.boolean().optional().default(true),
});

export { productSchema };
