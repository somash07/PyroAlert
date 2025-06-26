"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inquiryFormSchema = void 0;
const zod_1 = require("zod");
exports.inquiryFormSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Name is required"),
    phone: zod_1.z.string().min(1, "Invalid phone number").max(10, "Invalid phone number").optional(),
    email: zod_1.z.string().email("Invalid email address"),
    message: zod_1.z.string(),
});
