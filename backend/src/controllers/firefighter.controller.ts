import { NextFunction, Request, Response } from "express";
import { Firefighter } from "../models/fire-fighters.model";
import { AppError } from "../utils/AppError";
import { validationResult } from "express-validator";
import { sendCode } from "../utils/sendCode";
import { maileType } from "../types/mailType";
import crypto from "crypto";

import { Server as SocketIOServer } from "socket.io";
import mongoose from "mongoose";

declare module "express-serve-static-core" {
  interface Request {
    io?: SocketIOServer;
  }
}

const validStatus = ["available", "busy", "offline"];

export const getFirefightersByDepartment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { departmentId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(departmentId)) {
    return next(new AppError("Invalid department ID", 400));
  }

  try {
    const firefighters = await Firefighter.find({ departmentId }).sort({
      name: 1,
    });

    res.status(200).json({
      success: true,
      data: firefighters,
      count: firefighters.length,
    });
  } catch (error) {
    next(error);
  }
};
export const getAllFirefighters = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      status = "available",
      departmentId,
      limit = "50",
      page = "1",
    } = req.query;

    // Validate status
    if (typeof status !== "string" || !validStatus.includes(status)) {
      return next(new AppError("Invalid status field", 400));
    }

    // Build filter object
    const filter: Record<string, any> = {};
    if (status) filter.status = status;

    if (
      typeof departmentId === "string" &&
      mongoose.Types.ObjectId.isValid(departmentId)
    ) {
      filter.departmentId = departmentId;
    }

    const numericLimit = parseInt(limit as string, 10) || 50;
    const numericPage = parseInt(page as string, 10) || 1;

    // Query
    const firefighters = await Firefighter.find(filter)
      .sort({ name: 1 })
      .limit(numericLimit)
      .skip((numericPage - 1) * numericLimit);

    const total = await Firefighter.countDocuments(filter);

    // Response
    res.status(200).json({
      success: true,
      data: firefighters,
      pagination: {
        total,
        currentPage: numericPage,
        totalPages: Math.ceil(total / numericLimit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getFirefighterById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const firefighter = await Firefighter.findById(req.params.id);

    if (!firefighter) {
      return next(new AppError("Firefighter not found", 404));
    }

    res.json({
      success: true,
      data: firefighter,
    });
  } catch (error) {
    next(error);
  }
};

export const createFirefighter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError("Validation failed", 400, errors.array()));
    }


    const {
      name,
      email,
      contact,
      address,
      departmentId,
      status = "available",
    } = req.body;

    const existingFirefighter = await Firefighter.findOne({ email });
    if (existingFirefighter) {
      //  res.status(409).json({
      //     success: false,
      //     message: "FireFighter already exists",
      //   });
      return next(new AppError("Firefighter email already exists", 409));
    }

    let imagePath = "";
    if (req.file?.filename) {
      imagePath = `${req.protocol}://${req.get("host")}/uploads/fighters/${
        req.file.filename
      }`;
    }

    // Generate reset password token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    const resetPasswordExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const firefighter = new Firefighter({
      name,
      email,
      contact,
      address,
      departmentId,
      status,
      image: imagePath,
      resetPasswordToken,
      resetPasswordExpiry,
    });

    await firefighter.save();

    // Send password reset email
    const resetUrl = `${req.protocol}://${req.get("host")}/reset-password?token=${resetToken}&email=${email}&type=firefighter`;
    
    try {
      await sendCode(email, resetUrl, maileType.FIREFIGHTER_PASSWORD_RESET);
    } catch (emailError) {
      console.error("Failed to send password reset email:", emailError);
      // Don't fail the request if email fails
    }

    req.io?.emit("firefighter-added", firefighter);

    res.status(201).json({
      success: true,
      data: firefighter,
      message: "Firefighter added successfully. Password reset email sent.",
    });
  } catch (error) {
    next(error);
  }
};

export const updateFirefighter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError("Validation failed", 400, errors.array()));
    }

    const { name, email, contact, department, status, address} = req.body;

    if (email) {
      const existingFirefighter = await Firefighter.findOne({
        email,
        _id: { $ne: req.params.id },
      });
      if (existingFirefighter) {
        return next(new AppError("Email already exists", 400));
      }
    }

    const firefighter = await Firefighter.findByIdAndUpdate(
      req.params.id,
      { name, email, contact, department, status, address },
      { new: true, runValidators: true }
    );

    if (!firefighter) {
      return next(new AppError("Firefighter not found", 404));
    }

    // req.io?.emit("firefighter-updated", firefighter);

    res.json({
      success: true,
      data: firefighter,
      message: "Firefighter updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const deleteFirefighter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const firefighter = await Firefighter.findByIdAndDelete(req.params.id);

    if (!firefighter) {
      return next(new AppError("Firefighter not found", 404));
    }

    req.io?.emit("firefighter-deleted", { id: req.params.id });

    res.json({
      success: true,
      message: "Firefighter deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const updateFirefighterStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status } = req.body;

    if (!validStatus.includes(status)) {
      return next(new AppError("Invalid status", 400));
    }

    const firefighter = await Firefighter.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!firefighter) {
      return next(new AppError("Firefighter not found", 404));
    }

    req.io?.emit("firefighter-status-updated", firefighter);

    res.json({
      success: true,
      data: firefighter,
      message: "Status updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getAvailableFirefighters = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const firefighters = await Firefighter.find({ status: "available" }).sort({
      name: 1,
    });

    res.json({
      success: true,
      data: firefighters,
      count: firefighters.length,
    });
  } catch (error) {
    next(error);
  }
};

export const resetFirefighterPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token, email, password } = req.body;

    if (!token || !email || !password) {
      return next(new AppError("Token, email, and password are required", 400));
    }

    // Hash the token to compare with stored token
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find firefighter with valid token
    const firefighter = await Firefighter.findOne({
      email,
      resetPasswordToken,
      resetPasswordExpiry: { $gt: Date.now() },
    });

    if (!firefighter) {
      return next(new AppError("Invalid or expired reset token", 400));
    }

    // Hash the new password
    const bcrypt = require("bcryptjs");
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update firefighter password and clear reset token
    firefighter.password = hashedPassword;
    firefighter.resetPasswordToken = "";
    firefighter.resetPasswordExpiry = undefined;

    await firefighter.save();

    res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const sendFirefighterPasswordReset = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(new AppError("Email is required", 400));
    }

    const firefighter = await Firefighter.findOne({ email });

    if (!firefighter) {
      return next(new AppError("Firefighter not found", 404));
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    const resetPasswordExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update firefighter with reset token
    firefighter.resetPasswordToken = resetPasswordToken;
    firefighter.resetPasswordExpiry = resetPasswordExpiry;
    await firefighter.save();

    // Send password reset email
    const resetUrl = `${req.protocol}://${req.get("host")}/reset-password?token=${resetToken}&email=${email}&type=firefighter`;
    
    try {
      await sendCode(email, resetUrl, maileType.FIREFIGHTER_PASSWORD_RESET);
    } catch (emailError) {
      console.error("Failed to send password reset email:", emailError);
      return next(new AppError("Failed to send password reset email", 500));
    }

    res.json({
      success: true,
      message: "Password reset email sent successfully",
    });
  } catch (error) {
    next(error);
  }
};
