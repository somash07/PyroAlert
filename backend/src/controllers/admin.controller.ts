import { NextFunction, Request, Response } from "express";
import { Firefighter } from "../models/fire-fighters.model";
import { ClientRequest } from "../models/clientRequest.model";
import { AppError } from "../utils/AppError";
import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
export const getAdminFireFighters = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const firefighters = await Firefighter.find({});
    res.json({
      success: true,
      data: firefighters,
      count: firefighters.length,
    });
  } catch (error) {
    next(error);
  }
};

import mongoose from "mongoose";
import { User } from "../models/user.model";
import { io } from "../app";

export const addFirefighterAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      id,
      name,
      email,
      contact,
      address,
      isActive,
      status,
      departmentId,
    } = req.body;

    if (id && mongoose.Types.ObjectId.isValid(id)) {
      const existingFirefighter = await Firefighter.findById(id);
      if (existingFirefighter) {
        existingFirefighter.name = name ?? existingFirefighter.name;
        existingFirefighter.email = email ?? existingFirefighter.email;
        existingFirefighter.contact = contact ?? existingFirefighter.contact;
        existingFirefighter.address = address ?? existingFirefighter.address;
        existingFirefighter.isActive = isActive ?? existingFirefighter.isActive;
        existingFirefighter.status = status ?? existingFirefighter.status;
        existingFirefighter.departmentId =
          departmentId ?? existingFirefighter.departmentId;

        await existingFirefighter.save();

        res.status(200).json({
          success: true,
          message: "FireFighter Updated Successfully",
        });
        return;
      }
    }

    const firefighter = new Firefighter({
      name,
      email,
      contact,
      address,
      isActive,
      status,
      departmentId,
    });

    await firefighter.save();

    
    io?.emit("firefighter-added", firefighter);

    res.status(201).json({
      success: true,
      data: firefighter,
      message: "Firefighter added successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getFirefighterByIdAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const firefighter = await Firefighter.findById(req.params.id);
    console.log("firefighter", firefighter);
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

export const getAllUsersAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await User.find({});
    res.json({
      success: true,
      data: users.map((u) => ({
        id: u._id,
        username: u.username,
      })),
      count: users.length,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllDepartmentsAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const departments = await User.find({ type: "Firedepartment" });
    res.json({
      success: true,
      data: departments,
      count: departments.length,
    });
  } catch (error) {
    next(error);
  }
};

export const addDepartmentAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id, username, email, password, location, isActive } = req.body;

    // Validate required fields for new department
    if (!id && (!password || password.trim() === "")) {
      return next(
        new AppError("Password is required for new departments", 400)
      );
    }

    if (id && mongoose.Types.ObjectId.isValid(id)) {
      const existingDepartment = await User.findById(id);
      if (existingDepartment) {
        existingDepartment.username = username ?? existingDepartment.username;
        existingDepartment.email = email ?? existingDepartment.email;
        existingDepartment.location = location ?? existingDepartment.location;
        existingDepartment.isVerified =
          isActive ?? existingDepartment.isVerified;

        if (password && password.trim() !== "") {
          // Hash the password if provided

          existingDepartment.password = await bcrypt.hash(password, 10);
        }

        await existingDepartment.save();

        res.status(200).json({
          success: true,
          message: "Department Updated Successfully",
        });
        return;
      }
    }

    // Hash the password for new department

    const hashedPassword = await bcrypt.hash(password, 10);

    const department = new User({
      username,
      email,
      password: hashedPassword,
      type: "Firedepartment",
      location,
      isVerified: isActive ?? true,
    });

    await department.save();

    
    io?.emit("department-added", department);

    res.status(201).json({
      success: true,
      data: department,
      message: "Department added successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getDepartmentByIdAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const department = await User.findById(req.params.id);
    if (!department) {
      return next(new AppError("Department not found", 404));
    }

    res.json({
      success: true,
      data: department,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDepartmentAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const department = await User.findByIdAndDelete(req.params.id);
    if (!department) {
      return next(new AppError("Department not found", 404));
    }

    res.json({
      success: true,
      message: "Department deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getAllClientsAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const clients = await ClientRequest.find({}).sort({ createdAt: -1 });
    res.json({
      success: true,
      data: clients,
      count: clients.length,
    });
  } catch (error) {
    next(error);
  }
};
