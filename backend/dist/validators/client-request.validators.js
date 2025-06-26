"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientRequestSchema = void 0;
const zod_1 = require("zod");
exports.clientRequestSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Name is required"),
    phone: zod_1.z.string().min(1, "Invalid phone number").max(10, "Invalid phone number"),
    email: zod_1.z.string().email("Invalid email address"),
    buildingType: zod_1.z.string().min(1, "Building type is required"),
    address: zod_1.z.string().min(1, "Address is required"),
    location: zod_1.z.object({
        lat: zod_1.z.number({ required_error: "Latitude is required" }),
        lng: zod_1.z.number({ required_error: "Longitude is required" }),
    }),
    additionalInfo: zod_1.z.string().optional(),
});
