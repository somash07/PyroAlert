"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifySchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.verifySchema = zod_1.default.object({
    code: zod_1.default
        .string()
        .min(6, "Your code must be 6 digits long")
        .max(6, "Your code must be 6 digits long"),
});
