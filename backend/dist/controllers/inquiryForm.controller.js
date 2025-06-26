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
exports.createNewInquiryData = void 0;
const InquiryForm_model_1 = require("../models/InquiryForm.model");
const asyncHandeler_1 = __importDefault(require("../utils/asyncHandeler"));
const inquiry_form_validators_1 = require("../validators/inquiry-form.validators");
const createNewInquiryData = (0, asyncHandeler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const validationResult = inquiry_form_validators_1.inquiryFormSchema.safeParse(req.body);
    if (!validationResult.success) {
        const errors = validationResult.error.errors.map((error) => error.message);
        return res.status(400).json({
            success: false,
            message: "Validation error",
            errors,
        });
    }
    const { name, phone, email, message } = validationResult.data;
    const inquiryFormData = new InquiryForm_model_1.InquiryForm({
        name,
        phone,
        email,
        message,
    });
    const savedInquiryFormData = yield inquiryFormData.save();
    return res.status(201).json({
        success: true,
        message: "Inquiry form submitted successfully",
        data: savedInquiryFormData,
    });
}));
exports.createNewInquiryData = createNewInquiryData;
