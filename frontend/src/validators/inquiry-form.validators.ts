import { z } from "zod";

export const inquiryFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Invalid phone number").max(10,"Invalid phone number").optional(),
  email: z.string().email("Invalid email address"),
  message: z.string(),
});

export type Schema = z.infer<typeof inquiryFormSchema>;

