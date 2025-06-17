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
exports.sendCode = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
const mailType_1 = require("../types/mailType");
dotenv_1.default.config();
const sendCode = (email, code, _mailType) => {
    const transporter = nodemailer_1.default.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.ETHEREAL_USER,
            pass: process.env.ETHEREAL_PASS,
        },
        tls: {
            rejectUnauthorized: false,
        },
    });
    const main = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const info = yield transporter.sendMail({
                from: '"PyroAlert" <sahaara201@gmail.com>',
                to: email,
                subject: _mailType === mailType_1.maileType.RESET
                    ? `Your Reset Otp Code`
                    : _mailType === mailType_1.maileType.VERIFY_OTP
                        ? `Your Verification Code`
                        : "IGNORE THIS PLEASE",
                text: _mailType === mailType_1.maileType.RESET
                    ? `Your reset otp code is ${code}`
                    : _mailType === mailType_1.maileType.VERIFY_OTP
                        ? `Your verification code is ${code}`
                        : "IGNORE THIS PLEASE",
                html: _mailType === mailType_1.maileType.RESET
                    ? `

        <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
  <h2 style="color: #333; font-size: 24px; margin-bottom: 20px;">Hello there!</h2>
  <p style="margin-bottom: 20px;">You recently requested to reset your password. Please use the following verification code to proceed:</p>
  <div style="background-color: #f4f4f4; padding: 10px 20px; border-radius: 5px; margin-bottom: 20px;">
    <p style="font-size: 24px; font-weight: bold; color: #555; margin: 0;">${code}</p>
  </div>
  <p style="margin-bottom: 20px;">If you did not request a password reset, please ignore this email or contact our support team.</p>
  <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
  <p style="color: #777; margin-bottom: 0;">Best regards,<br />Pyroalert</p>
  <p style="color: #777; font-size: 14px; margin-top: 5px;">(This is an automated message. Please do not reply.)</p>
</div>

    
        `
                    : _mailType === mailType_1.maileType.VERIFY_OTP
                        ? `
          <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
        <h2 style="color: #333; font-size: 24px; margin-bottom: 20px;">Hello there!</h2>
        <p style="margin-bottom: 20px;">Thank you for signing up. Please use the following verification code to confirm your email address:</p>
        <div style="background-color: #f4f4f4; padding: 10px 20px; border-radius: 5px; margin-bottom: 20px;">
            <p style="font-size: 24px; font-weight: bold; color: #555; margin: 0;">${code}</p>
        </div>
        <p style="margin-bottom: 20px;">If you did not request this, simply ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="color: #777; margin-bottom: 0;">Best regards,<br />Sahaara</p>
        <p style="color: #777; font-size: 14px; margin-top: 5px;">(This is an automated message. Please do not reply.)</p>
    </div>
        `
                        : "",
            });
            console.log("Message sent: %s", info.messageId);
        }
        catch (error) {
            console.error("Error sending email:", error);
        }
    });
    main().catch(console.error);
};
exports.sendCode = sendCode;
