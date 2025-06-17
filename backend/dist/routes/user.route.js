"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoute = void 0;
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const asyncHandeler_1 = __importDefault(require("../utils/asyncHandeler"));
const router = express_1.default.Router();
exports.userRoute = router;
router.route("/sign-up").post(user_controller_1.signUpHandler);
router.route("/sign-in").post(user_controller_1.signInHandler);
router.route("/verify-code").post(user_controller_1.codeVerifier);
router.route("/get-verification-code").post(user_controller_1.getVerificationCode);
router.route("/reset-password").post(user_controller_1.resetPassword);
router.route("/logout").post((0, asyncHandeler_1.default)(auth_middleware_1.authenticateWithJwt), user_controller_1.logoutUser);
router.route("/refresh-token").post(user_controller_1.refreshAccessToken);
