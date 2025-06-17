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
exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const user_model_1 = require("../models/user.model");
dotenv_1.default.config();
function generateAccessToken(payload) {
    const secret = process.env.ACCESS_TOKEN_SECRET;
    if (!secret)
        throw new Error("ACCESS_TOKEN_SECRET must be defined");
    const options = {
        expiresIn: "1d",
    };
    return jsonwebtoken_1.default.sign(payload, secret, options);
}
exports.generateAccessToken = generateAccessToken;
function generateRefreshToken(payload) {
    const secret = process.env.REFRESH_TOKEN_SECRET;
    if (!secret)
        throw new Error("REFRESH_TOKEN_SECRET must be defined");
    const options = {
        expiresIn: "7d",
    };
    return jsonwebtoken_1.default.sign(payload, secret, options);
}
exports.generateRefreshToken = generateRefreshToken;
const generateAccessAndRefreshTokens = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const userFound = yield user_model_1.User.findById({ _id: user._id });
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    return { accessToken, refreshToken };
});
