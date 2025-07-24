import express, { NextFunction, Request, Response } from "express";
import {
  getAllFirefighters,
  createFirefighter,
  deleteFirefighter,
  getAvailableFirefighters,
  getFirefighterById,
  updateFirefighter,
  updateFirefighterStatus,
  getFirefightersByDepartment,
  resetFirefighterPassword,
  sendFirefighterPasswordReset,
  validateResetToken,
  loginFirefighter,
  getFirefighterProfile,
  updateFirefighterProfile,
  changePassword,
  logoutFirefighter,
} from "../controllers/firefighter.controller";
import mongoose from "mongoose";
import { AppError } from "../utils/AppError";
import { body } from "express-validator";
import upload from "../middlewares/multer.middleware";
import {
  addFirefighterAdmin,
  getAdminFireFighters,
  getFirefighterByIdAdmin,
} from "../controllers/admin.controller";
import { authenticateWithJwt, authorize } from "../middlewares/auth.middleware";
const router = express.Router();

export const validateObjectId = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new AppError("Invalid ID format", 400));
  }
  next();
};

router.get(
  "/getAllFirefightersAdmin",
  authenticateWithJwt,
  authorize(["Admin"]),
  getAdminFireFighters
);

router.post(
  "/addFirefighterAdmin",
  authenticateWithJwt,
  authorize(["Admin"]),
  addFirefighterAdmin
);

router.get("/getSingleFirefighterAdmin/:id", getFirefighterByIdAdmin);

// Get all firefighters
router.get("/", getAllFirefighters);

//get firefighters according to department
router.get("/:departmentId", getFirefightersByDepartment);

// Get available firefighters
router.get("/available", getAvailableFirefighters);

// Get firefighter by ID
router.get("/:id", validateObjectId, getFirefighterById);

// Create new firefighter
router.post("/", upload.single("image"), createFirefighter);

// Update firefighter
router.patch("/:id", validateObjectId, updateFirefighter);

// Update firefighter status
router.patch(
  "/:id/status",
  [
    validateObjectId,
    body("status")
      .isIn(["available", "busy", "offline"])
      .withMessage("Invalid status"),
  ],
  updateFirefighterStatus
);

// Delete firefighter
router.delete("/:id", validateObjectId, deleteFirefighter);

// Password reset routes
router.post("/reset-password", resetFirefighterPassword);
router.post("/send-reset-email", sendFirefighterPasswordReset);
router.post("/forgot-password", resetFirefighterPassword);
router.post("/validate-token", validateResetToken);

// Mobile app routes
router.post("/login", loginFirefighter);
router.get("/me", authenticateWithJwt, getFirefighterProfile);
router.patch("/profile", authenticateWithJwt, updateFirefighterProfile);
router.patch("/change-password", authenticateWithJwt, changePassword);
router.post("/logout", authenticateWithJwt, logoutFirefighter);

export { router as fireFighterRoute };
