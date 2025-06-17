import express from "express";
import {
  signUpHandler,
  signInHandler,
  codeVerifier,
  getVerificationCode,
  resetPassword,
  logoutUser,
  refreshAccessToken,
} from "../controllers/user.controller";
import { authenticateWithJwt, authorize } from "../middlewares/auth.middleware";
import asyncHandler from "../utils/asyncHandeler";

const router = express.Router();

router.route("/sign-up").post(signUpHandler);

router.route("/sign-in").post(signInHandler);

router.route("/verify-code").post(codeVerifier);

router.route("/get-verification-code").post(getVerificationCode);

router.route("/reset-password").post(resetPassword);

router.route("/logout").post(asyncHandler(authenticateWithJwt), logoutUser);

router.route("/refresh-token").post(refreshAccessToken);



export { router as userRoute };
