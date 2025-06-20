import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { ClientRequest } from "../models/clientRequest.model";
import asyncHandler from "../utils/asyncHandeler";
import { sendCode } from "../utils/sendCode";
import { maileType } from "../types/mailType";
import { clientRequestSchema } from "../validators/client-request.validators";

const createNewClientRequest = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const {
      name,
      phone,
      email,
      buildingType,
      address,
      location,
      additionalInfo,
    } = req.body;

    const validationResult = clientRequestSchema.safeParse({
      name,
      phone,
      email,
      buildingType,
      address,
      location,
      additionalInfo,
    });

    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(
        (error) => error.message
      );
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: errors,
      });
    }

    if (
      !name ||
      !phone ||
      !email ||
      !buildingType ||
      !address ||
      !location ||
      location.lat == null ||
      location.lng == null
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided.",
      });
    }

    const clientRequest = new ClientRequest({
      name,
      phone,
      email,
      buildingType,
      address,
      location,
      additionalInfo,
    });

    const savedPost = await clientRequest.save();

    await sendCode(email, "", maileType.CLIENT_REQUEST);

    res.status(201).json({
      success: true,
      message: "Request form submitted",
      data: savedPost,
    });
  }
);

export { createNewClientRequest };
