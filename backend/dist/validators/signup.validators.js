"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signupSchema = void 0;
const zod_1 = require("zod");
exports.signupSchema = zod_1.z.object({
    username: zod_1.z
        .string()
        .min(2, { message: "username must be less than of 2 characters" })
        .max(20, { message: "username must be more than of 20 characters" }),
    email: zod_1.z.string().email({ message: "Invalid email address" }),
    password: zod_1.z
        .string()
        .min(8, { message: "Your password must be at least 8 characters long" })
        .refine((data) => {
        return /[A-Z]/.test(data);
    }, { message: "Your password must contain at least one uppercase letter" })
        .refine((data) => {
        return /[a-z]/.test(data);
    }, { message: "Your password must contain at least one lowercase letter" })
        .refine((data) => {
        return /[!@#$%^&*(),.?":{}|<>]/.test(data);
    }, { message: "Your password must contain at least one special character" }),
    type: zod_1.z.enum(["Firedepartment", "Admin"]),
});
