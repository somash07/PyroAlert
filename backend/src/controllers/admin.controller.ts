import { NextFunction, Request, Response } from "express";
import { Firefighter } from "../models/fire-fighters.model";
import { AppError } from "../utils/AppError";
import { validationResult } from "express-validator";

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

    req.io?.emit("firefighter-added", firefighter);

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
