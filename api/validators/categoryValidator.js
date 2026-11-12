import { z } from "zod";

const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Category name must be at least 3 characters.")
    .max(100, "Category name cannot exceed 100 characters."),

  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters.")
    .optional()
    .default(""),
});

export { categorySchema };
