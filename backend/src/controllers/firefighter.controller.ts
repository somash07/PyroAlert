import { NextFunction, Request, Response } from "express";
import { Firefighter } from "../models/fire-fighters.model";
import { AppError } from "../utils/AppError";
import { validationResult } from "express-validator";
import { sendCode } from "../utils/sendCode";
import { maileType } from "../types/mailType";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { Server as SocketIOServer } from "socket.io";
import mongoose from "mongoose";
import { User } from "../models/user.model";
import asyncHandler from "../utils/asyncHandeler";
import { generateAccessToken } from "../utils/generateTokens";
import { AuthRequest } from "../middlewares/auth.middleware";
import { io } from "../app";
import uploadOnCloudinary from "../utils/cloudinary";
import fs from "fs";

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
  req: any,
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
    if (req.file?.path) {
      const cloudinaryResponse = await uploadOnCloudinary(req.file.path);
      if (cloudinaryResponse?.url) {
        imagePath = cloudinaryResponse.url;
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      }
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
    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/forgot-password?token=${resetToken}&email=${email}&type=firefighter`;

    try {
      await sendCode(email, resetUrl, maileType.FIREFIGHTER_PASSWORD_RESET);
    } catch (emailError) {
      console.error("Failed to send password reset email:", emailError);
      // Don't fail the request if email fails
    }

    // io?.emit("firefighter-added", firefighter);

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

    const { name, email, contact, department, status, address } = req.body;

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

    // io?.emit("firefighter-updated", firefighter);

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

    io?.emit("firefighter-deleted", { id: req.params.id });

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

    io?.emit("firefighter-status-updated", firefighter);

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
    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/forgot-password?token=${resetToken}&email=${email}&type=firefighter`;

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

// Validate reset token
export const validateResetToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token, email } = req.body;

    if (!token || !email) {
      return next(new AppError("Token and email are required", 400));
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

    res.json({
      success: true,
      message: "Token is valid",
    });
  } catch (error) {
    next(error);
  }
};

// Firefighter login for mobile app
export const loginFirefighter = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError("Email and password are required", 400);
    }

    // Find firefighter by email
    const firefighter = await Firefighter.findOne({ email }).select(
      "+password"
    );

    if (!firefighter) {
      throw new AppError("Invalid credentials", 401);
    }

    // Check if password is set
    if (!firefighter.password) {
      throw new AppError(
        "Password not set. Please use password reset first.",
        401
      );
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(
      password,
      firefighter.password
    );
    if (!isPasswordValid) {
      throw new AppError("Invalid credentials", 401);
    }

    // Check if firefighter is active
    if (!firefighter.isActive) {
      throw new AppError("Account is deactivated", 401);
    }

    const ff = {
      username: firefighter.name,
      email,
      type: "user",
      isVerified: true,
    };
    // Generate token
    const token = generateAccessToken(ff as any);

    // Remove password from response
    firefighter.password = undefined;

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: firefighter,
        token,
      },
    });
  }
);

// Get firefighter profile
export const getFirefighterProfile = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const firefighterId = req.user?.id;

    const firefighter = await User.findById(firefighterId);
    if (!firefighter) {
      throw new AppError("Firefighter not found", 404);
    }

    res.status(200).json({
      success: true,
      data: firefighter,
    });
  }
);

// Update firefighter profile
export const updateFirefighterProfile = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const firefighterId = req.user?.id;
    const { name, contact, address, status } = req.body;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (contact) updateData.contact = contact;
    if (address) updateData.address = address;
    if (status) updateData.status = status;

    const firefighter = await User.findByIdAndUpdate(
      firefighterId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!firefighter) {
      throw new AppError("Firefighter not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: firefighter,
    });
  }
);

// Change password
export const changePassword = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const firefighterId = req.user?.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new AppError("Current password and new password are required", 400);
    }

    const firefighter = await User.findById(firefighterId).select("+password");
    if (!firefighter) {
      throw new AppError("Firefighter not found", 404);
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      firefighter.password
    );

    if (!isCurrentPasswordValid) {
      throw new AppError("Current password is incorrect", 401);
    }

    // Update password
    firefighter.password = newPassword;
    await firefighter.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  }
);

// Logout firefighter
export const logoutFirefighter = asyncHandler(
  async (req: Request, res: Response) => {
    // In a real implementation, you might want to blacklist the token
    // For now, we'll just return a success response
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  }
);

export const getFireFighterUserDetailById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const firefighterId = req.params.id;

  const firefighter = await Firefighter.findById(firefighterId);
  if (!firefighter) {
    throw new AppError("Firefighter not found", 404);
  }

  const dataToSend = {
    name: firefighter.name,
    email: firefighter.email,
    status: firefighter.status,
  };

  res.status(200).json({
    success: true,
    data: dataToSend,
  });
};
