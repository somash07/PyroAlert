"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientRequest = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const CoordinatesSchema = new mongoose_1.Schema({
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
}, { _id: false });
const ClientRequestSchema = new mongoose_1.Schema({
    name: { type: String, required: [true, "Name is required"] },
    phone: { type: String, required: [true, "Phone number is required"] },
    email: { type: String, required: [true, "Email is required "] },
    buildingType: {
        type: String,
        required: [true, "Building type  is required "],
    },
    address: { type: String },
    location: { type: CoordinatesSchema, required: true },
    additionalInfo: { type: String },
    applicationStatus: {
        type: String,
        enum: ["inactive", "active"],
        default: "inactive",
    },
}, {
    timestamps: { createdAt: true, updatedAt: false },
});
exports.ClientRequest = mongoose_1.default.model("ClientRequest", ClientRequestSchema);
