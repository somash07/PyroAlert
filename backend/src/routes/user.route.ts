import express from "express";
import {
  signUpHandler,
  signInHandler,
  codeVerifier,
  getVerificationCode,
  resetPassword,
  logoutUser,
  refreshAccessToken,
  adminLoginHandler,
} from "../controllers/user.controller";
import { authenticateWithJwt, authorize } from "../middlewares/auth.middleware";
import asyncHandler from "../utils/asyncHandeler";
import { 
  getAllUsersAdmin,
  getAllDepartmentsAdmin,
  addDepartmentAdmin,
  getDepartmentByIdAdmin,
  deleteDepartmentAdmin,
  getAllClientsAdmin
} from "../controllers/admin.controller";

const router = express.Router();

router.get(
  "/admin/users",
  authenticateWithJwt,
  authorize(["Admin"]),
  getAllUsersAdmin
);

// Department management routes
router.get(
  "/admin/departments",
  authenticateWithJwt,
  authorize(["Admin"]),
  getAllDepartmentsAdmin
);

router.post(
  "/admin/departments",
  authenticateWithJwt,
  authorize(["Admin"]),
  addDepartmentAdmin
);

router.get(
  "/admin/departments/:id",
  authenticateWithJwt,
  authorize(["Admin"]),
  getDepartmentByIdAdmin
);

router.delete(
  "/admin/departments/:id",
  authenticateWithJwt,
  authorize(["Admin"]),
  deleteDepartmentAdmin
);

// Client management routes
router.get(
  "/admin/clients",
  authenticateWithJwt,
  authorize(["Admin"]),
  getAllClientsAdmin
);

router.route("/sign-up").post(signUpHandler);

router.route("/sign-in").post(signInHandler);

router.post("/admin/login", adminLoginHandler);

router.route("/verify-code").post(codeVerifier);

router.route("/get-verification-code").post(getVerificationCode);

router.route("/reset-password").post(resetPassword);

router.route("/logout").post(asyncHandler(authenticateWithJwt), logoutUser);

router.route("/refresh-token").post(refreshAccessToken);

export { router as userRoute };
