import { NextFunction, Request, Response } from "express";
import { Firefighter } from "../models/fire-fighters.models";
import { AppError } from "../utils/AppError";
import { validationResult } from "express-validator";

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
    const firefighters = await Firefighter.find({ departmentId }).sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: firefighters,
      count: firefighters.length,
    });
  } catch (error) {
    next(error);
  }

}
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
      return next(new AppError("Email already exists", 400));
    }

    const firefighter = new Firefighter({
      name,
      email,
      contact,
      address,
      departmentId,
      status,
    });

    await firefighter.save();

    req.io?.emit("firefighter-added", firefighter); // Optional chaining in case `io` is missing

    res.status(201).json({
      success: true,
      data: firefighter,
      message: "Firefighter added successfully",
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

    const { name, email, contact, department, status , address} = req.body;

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
      { name, email, contact, department, status , address},
      { new: true, runValidators: true }
    );

    if (!firefighter) {
      return next(new AppError("Firefighter not found", 404));
    }

    req.io?.emit("firefighter-updated", firefighter);

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
