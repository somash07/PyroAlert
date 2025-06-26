"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNewClientRequest = void 0;
const clientRequest_model_1 = require("../models/clientRequest.model");
const asyncHandeler_1 = __importDefault(require("../utils/asyncHandeler"));
const sendCode_1 = require("../utils/sendCode");
const mailType_1 = require("../types/mailType");
const client_request_validators_1 = require("../validators/client-request.validators");
const createNewClientRequest = (0, asyncHandeler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, phone, email, buildingType, address, location, additionalInfo, } = req.body;
    const validationResult = client_request_validators_1.clientRequestSchema.safeParse({
        name,
        phone,
        email,
        buildingType,
        address,
        location,
        additionalInfo,
    });
    if (!validationResult.success) {
        const errors = validationResult.error.errors.map((error) => error.message);
        return res.status(400).json({
            success: false,
            message: "Validation error",
            errors: errors,
        });
    }
    if (!name ||
        !phone ||
        !email ||
        !buildingType ||
        !address ||
        !location ||
        location.lat == null ||
        location.lng == null) {
        return res.status(400).json({
            success: false,
            message: "All required fields must be provided.",
        });
    }
    const clientRequest = new clientRequest_model_1.ClientRequest({
        name,
        phone,
        email,
        buildingType,
        address,
        location,
        additionalInfo,
    });
    const savedPost = yield clientRequest.save();
    yield (0, sendCode_1.sendCode)(email, "", mailType_1.maileType.CLIENT_REQUEST);
    res.status(201).json({
        success: true,
        message: "Request form submitted",
        data: savedPost,
    });
}));
exports.createNewClientRequest = createNewClientRequest;
