import express, { NextFunction, Request, Response } from "express";
import {
  getAllFirefighters,
  createFirefighter,
  deleteFirefighter,
  getAvailableFirefighters,
  getFirefighterById,
  updateFirefighter,
  updateFirefighterStatus,
} from "../controllers/firefighter.controller";
import mongoose from "mongoose";
import { AppError } from "../utils/AppError";
import { body } from "express-validator";
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


// Get all firefighters
router.get("/", getAllFirefighters);

// Get available firefighters
router.get("/available", getAvailableFirefighters);

// Get firefighter by ID
router.get("/:id", validateObjectId, getFirefighterById);

// Create new firefighter
router.post("/", createFirefighter);

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

export { router as fireFighterRoute };
