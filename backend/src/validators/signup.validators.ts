import { z } from "zod";

export const signupSchema = z.object({
  username: z
    .string()
    .min(2, { message: "username must be more than of 2 characters" })
    .max(40, { message: "username must be less than of 40 characters" }),
    
  email: z.string().email({ message: "Invalid email address" }),
  
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
  type: z.enum(["Firedepartment", "Admin"]).optional(),
  
  location: z.object({
   
  })
});

export type SignupInput = z.infer<typeof signupSchema>;
