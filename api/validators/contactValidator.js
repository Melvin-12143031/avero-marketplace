import { z } from "zod";

const contactInquirySchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(150, "Name cannot exceed 150 characters."),

  email: z
    .string()
    .trim()
    .email("Please provide a valid email address.")
    .max(255, "Email cannot exceed 255 characters."),

  phone: z
    .string()
    .trim()
    .max(30, "Phone number cannot exceed 30 characters.")
    .optional()
    .or(z.literal("")),

  inquiry_type: z
    .string()
    .trim()
    .min(2, "Please provide an inquiry type.")
    .max(50, "Inquiry type cannot exceed 50 characters."),

  subject: z
    .string()
    .trim()
    .min(3, "Subject must be at least 3 characters.")
    .max(150, "Subject cannot exceed 150 characters."),

  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters.")
    .max(5000, "Message cannot exceed 5000 characters."),
});

export { contactInquirySchema };
