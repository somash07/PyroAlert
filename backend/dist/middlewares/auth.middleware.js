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
exports.authorize = exports.authenticateWithJwt = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = require("../models/user.model");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const authenticateWithJwt = (req, res, next) => {
    var _a;
    const token = req.cookies.accessToken || ((_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1]);
    if (!token) {
        return res.status(400).json({
            success: false,
            message: "Invalid Token",
        });
    }
    jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, token) => __awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            return res.status(400).json({
                message: "Something went wrong while verifying token",
                success: false,
            });
        }
        try {
            const user = yield user_model_1.User.findById({ _id: token === null || token === void 0 ? void 0 : token._id }).select("-password -refreshToken -verifyCode -verifyCodeExpiry");
            if (!user) {
                return res.status(404).json({ message: "User not found." });
            }
            req.user = user;
            next();
        }
        catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
                success: false,
            });
        }
    }));
};
exports.authenticateWithJwt = authenticateWithJwt;
const authorize = (types) => {
    return (req, res, next) => {
        if (!types.includes(req.user.type)) {
            return res.status(500).json({
                message: "Invalid Role",
                success: false,
            });
        }
        next();
    };
};
exports.authorize = authorize;
