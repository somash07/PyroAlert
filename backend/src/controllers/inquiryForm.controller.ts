import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { InquiryForm } from "../models/InquiryForm.model";
import asyncHandler from "../utils/asyncHandeler";
import { inquiryFormSchema } from "../validators/inquiry-form.validators";

const createNewInquiryData = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const validationResult = inquiryFormSchema.safeParse(req.body);

    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((error) => error.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors,
      });
    }

    const { name, phone, email, message } = validationResult.data;

    const inquiryFormData = new InquiryForm({
      name,
      phone,
      email,
      message,
    });

    const savedInquiryFormData = await inquiryFormData.save();

    return res.status(201).json({
      success: true,
      message: "Inquiry form submitted successfully",
      data: savedInquiryFormData,
    });
  }
);

export { createNewInquiryData };
