import { z } from "zod";

export const signupSchema = z
  .object({
    username: z
      .string()
      .min(2, { message: "username must be more than of 2 characters" })
      .max(30, { message: "username must be less than of 30 characters" }),
    email: z
      .string()
      .email({ message: "Invalid email address" }),
    location: z.object(
      {
        lat: z
          .number({ invalid_type_error: "Latitude must be a number" })
          .refine((val) => !isNaN(val), { message: "Latitude is required" }),
        lng: z
          .number({ invalid_type_error: "Longitude must be a number" })
          .refine((val) => !isNaN(val), { message: "Longitude is required" }),
      },
      { message: "Location is required" }
    ),
    password: z
      .string()
      .min(8, { message: "Your password must be at least 8 characters long" })
      .refine(
        (data) => {
          return /[A-Z]/.test(data);
        },
        { message: "Your password must contain at least one uppercase letter" }
      )
      .refine(
        (data) => {
          return /[a-z]/.test(data);
        },
        { message: "Your password must contain at least one lowercase letter" }
      )
      .refine(
        (data) => {
          return /[!@#$%^&*(),.?":{}|<>]/.test(data);
        },
        { message: "Your password must contain at least one special character" }
      ),

    confirmPassword: z.string(),
    type: z.string(),
  })

  .refine((data) => data.confirmPassword === data.password, {
    message: "passwords do not match",
    path: ["confirmPassword"],
  });

export type Schema = z.infer<typeof signupSchema>;
