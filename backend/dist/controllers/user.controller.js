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
exports.refreshAccessToken = exports.logoutUser = exports.resetPassword = exports.getVerificationCode = exports.codeVerifier = exports.signInHandler = exports.signUpHandler = exports.adminLoginHandler = void 0;
const user_model_1 = require("../models/user.model");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const signup_validators_1 = require("../validators/signup.validators");
const signin_validators_1 = require("../validators/signin.validators");
const generateTokens_1 = require("../utils/generateTokens");
const verify_code_validators_1 = require("../validators/verify-code.validators");
const asyncHandeler_1 = __importDefault(require("../utils/asyncHandeler"));
const sendCode_1 = require("../utils/sendCode");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const mailType_1 = require("../types/mailType");
dotenv_1.default.config();
const options = {
    httpOnly: true,
    secure: true,
};
const signUpHandler = (0, asyncHandeler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { username, email, password, type, location } = req.body;
    const { lat, lng } = location;
    // Default to "Firedepartment" if not provided
    if (!type) {
        type = user_model_1.UserType.Firedepartment;
    }
    const validationResult = signup_validators_1.signupSchema.safeParse({
        username,
        email,
        password,
        type,
        location: {
            lat,
            lng,
        },
    });
    if (!validationResult.success) {
        const errors = validationResult.error.errors.map((error) => error.message);
        return res.status(400).json({
            success: false,
            message: "Validation error",
            errors: errors,
        });
    }
    if (!username || !email || !password || !type || !lat || !lng) {
        return res.status(400).json({
            success: false,
            message: "Some field is missing here",
        });
    }
    if (!Object.values(user_model_1.UserType).includes(type)) {
        return res.status(400).json({
            success: false,
            message: "Invalid user type",
        });
    }
    const existingUser = yield user_model_1.User.findOne({ $or: [{ email }, { username }] });
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
    if (existingUser) {
        if (existingUser.isVerified) {
            return res.status(409).json({
                success: false,
                message: "User already exists",
            });
        }
        else {
            existingUser.username = username;
            existingUser.email = email;
            existingUser.password = hashedPassword;
            existingUser.verifyCode = verifyCode;
            existingUser.verifyCodeExpiry = new Date(Date.now() + 3600000);
            (existingUser.location = {
                lat: lat,
                lng: lng,
            }),
                yield existingUser.save();
            yield (0, sendCode_1.sendCode)(email, verifyCode, mailType_1.maileType.VERIFY_OTP);
            return res.status(200).json({
                success: true,
                message: "User updated successfully. Verification code sent.",
            });
        }
    }
    else {
        const verifyCodeExpiry = new Date(Date.now() + 3600000);
        const newUser = new user_model_1.User({
            username,
            email,
            password: hashedPassword,
            type: type || user_model_1.UserType.Firedepartment,
            verifyCode,
            isVerified: false,
            verifyCodeExpiry,
            location: {
                lat: lat,
                lng: lng,
            },
        });
        yield newUser.save();
        yield (0, sendCode_1.sendCode)(email, verifyCode, mailType_1.maileType.VERIFY_OTP);
        return res.status(201).json({
            success: true,
            message: "User successfully created. Verification code sent.",
            data: newUser,
        });
    }
}));
exports.signUpHandler = signUpHandler;
const signInHandler = (0, asyncHandeler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { identifier, password } = req.body;
    const signInValidationResult = signin_validators_1.signinSchema.safeParse({
        identifier,
        password,
    });
    if (!signInValidationResult.success) {
        const errors = signInValidationResult.error.errors.map((error) => error.message);
        return res.status(400).json({
            success: false,
            message: "Validation Error",
            errors: errors,
        });
    }
    const { data } = signInValidationResult;
    const user = yield user_model_1.User.findOne({
        $or: [{ email: data.identifier }, { username: data.identifier }],
    });
    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Invalid credentials",
        });
    }
    const isPasswordCorrect = yield bcryptjs_1.default.compare(data.password, user.password);
    if (!isPasswordCorrect) {
        return res.status(401).json({
            success: false,
            message: "Invalid credentials",
        });
    }
    if (!user.isVerified) {
        return res.status(403).json({
            success: false,
            message: "Account not verified. Please verify your account.",
        });
    }
    const refreshToken = yield (0, generateTokens_1.generateRefreshToken)(user);
    const accessToken = yield (0, generateTokens_1.generateAccessToken)(user);
    user.refreshToken = refreshToken;
    yield user.save({ validateBeforeSave: false });
    res.cookie("refreshToken", refreshToken, options);
    res.cookie("accessToken", accessToken, options);
    let loggedInUser;
    if (user.type === user_model_1.UserType.Admin) {
        loggedInUser = {
            _id: user._id,
            username: user.username,
            email: user.email,
            type: user.type,
        };
    }
    else {
        loggedInUser = {
            _id: user._id,
            username: user.username,
            email: user.email,
            type: user.type,
            lat: (_a = user.location) === null || _a === void 0 ? void 0 : _a.lat,
            lng: (_b = user.location) === null || _b === void 0 ? void 0 : _b.lng,
        };
    }
    return res.status(200).json({
        success: true,
        message: "User logged in successfully",
        data: { user: loggedInUser, refreshToken, accessToken },
    });
}));
exports.signInHandler = signInHandler;
exports.adminLoginHandler = (0, asyncHandeler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
        return res.status(400).json({
            success: false,
            message: "Email or username and password are required.",
        });
    }
    if (identifier !== process.env.ADMIN_EMAIL &&
        identifier !== process.env.ADMIN_USERNAME) {
        return res.status(401).json({
            success: false,
            message: "Invalid credentials.",
        });
    }
    const adminUser = yield user_model_1.User.findOne({
        $or: [
            { email: process.env.ADMIN_EMAIL },
            { username: process.env.ADMIN_USERNAME },
        ],
    });
    if (!adminUser) {
        return res.status(500).json({
            success: false,
            message: "Admin user not initialized. Please seed the database.",
        });
    }
    const isPasswordCorrect = yield bcryptjs_1.default.compare(password, adminUser.password);
    if (!isPasswordCorrect) {
        return res.status(401).json({
            success: false,
            message: "Passwords do not match.",
        });
    }
    const refreshToken = yield (0, generateTokens_1.generateRefreshToken)(adminUser);
    const accessToken = yield (0, generateTokens_1.generateAccessToken)(adminUser);
    res.cookie("refreshToken", refreshToken, options);
    res.cookie("accessToken", accessToken, options);
    return res.status(200).json({
        success: true,
        message: "Admin logged in successfully",
        data: {
            user: {
                _id: adminUser._id,
                username: adminUser.username,
                email: adminUser.email,
                type: adminUser.type,
            },
            refreshToken,
            accessToken,
        },
    });
}));
const codeVerifier = (0, asyncHandeler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, verifyCode } = req.body;
    const verifyCodeValidation = verify_code_validators_1.verifySchema.safeParse({ code: verifyCode });
    if (!verifyCodeValidation.success) {
        return res.status(400).json({
            success: false,
            message: verifyCodeValidation.error.errors[0].message,
        });
    }
    const user = yield user_model_1.User.findOne({ username });
    // console.log(user)
    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User with this username does not exist",
        });
    }
    const isVerifyCodeCorrect = user.verifyCode === verifyCode;
    const isVerifyCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();
    if (isVerifyCodeCorrect && isVerifyCodeNotExpired) {
        user.isVerified = true;
        yield user.save();
        return res.status(200).json({
            success: true,
            message: "User verified successfully",
        });
    }
    else if (!isVerifyCodeCorrect) {
        return res.status(400).json({
            success: false,
            message: "Incorrect Verification Code, Please try again",
        });
    }
    else if (!isVerifyCodeNotExpired) {
        return res.status(400).json({
            success: false,
            message: "Verification Code Expired, Please Login again",
        });
    }
}));
exports.codeVerifier = codeVerifier;
const getVerificationCode = (0, asyncHandeler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({
            success: false,
            message: "Email is required",
        });
    }
    const user = yield user_model_1.User.findOne({ email, isVerified: true });
    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User Not Found",
        });
    }
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.verifyCode = verifyCode;
    user.verifyCodeExpiry = new Date(Date.now() + 60000);
    yield user.save();
    yield (0, sendCode_1.sendCode)(email, verifyCode, mailType_1.maileType.RESET);
    res.status(200).json({
        success: true,
        message: "Verification code has been sent to your email.",
    });
}));
exports.getVerificationCode = getVerificationCode;
const resetPassword = (0, asyncHandeler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
        return res.status(400).json({
            success: false,
            message: "All fields are required",
        });
    }
    const user = yield user_model_1.User.findOne({
        email,
    });
    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User with this username cannot be found",
        });
    }
    const isVerifyCodeCorrect = user.verifyCode === code;
    const isVerifyCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();
    if (isVerifyCodeCorrect && isVerifyCodeNotExpired) {
        const hashedPassword = yield bcryptjs_1.default.hash(newPassword, 10);
        user.password = hashedPassword;
        yield user.save();
        return res.status(200).json({
            success: true,
            message: "User's password successfully changed",
        });
    }
    else if (!isVerifyCodeCorrect) {
        return res.status(400).json({
            success: false,
            message: "Incorrect Verification Code, Please try again",
        });
    }
    else if (!isVerifyCodeNotExpired) {
        return res.status(400).json({
            success: false,
            message: "Verification Code Expired, Please Login again",
        });
    }
}));
exports.resetPassword = resetPassword;
const logoutUser = (0, asyncHandeler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(req.user._id);
    if (user) {
        user.refreshToken = undefined;
        yield user.save({ validateBeforeSave: false });
    }
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json({ success: true, message: "User logged out successfully" });
}));
exports.logoutUser = logoutUser;
const refreshAccessToken = (0, asyncHandeler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.cookies.refreshToken;
    if (!token) {
        return res.status(404).json({
            success: false,
            message: "No Token Available",
        });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.REFRESH_TOKEN_SECRET);
        const user = yield user_model_1.User.findById(decoded._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Invalid Token",
            });
        }
        if (token !== user.refreshToken) {
            return res.status(400).json({
                success: false,
                message: "Token has Expired",
            });
        }
        const newRefreshToken = yield (0, generateTokens_1.generateRefreshToken)(user);
        const accessToken = yield (0, generateTokens_1.generateAccessToken)(user);
        user.refreshToken = newRefreshToken;
        yield user.save({ validateBeforeSave: false });
        res.cookie("refreshToken", newRefreshToken, options);
        res.cookie("accessToken", accessToken, options);
        const loggedInUser = {
            _id: user._id,
            username: user.username,
            email: user.email,
            type: user.type,
            isVerified: user.isVerified,
        };
        return res.status(200).json({
            success: true,
            message: "User logged in successfully",
            data: {
                user: loggedInUser,
                refreshToken: newRefreshToken,
                accessToken,
            },
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
}));
exports.refreshAccessToken = refreshAccessToken;
