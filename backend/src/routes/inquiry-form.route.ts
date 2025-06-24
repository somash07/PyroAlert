import express from "express";
import { createNewInquiryData } from "../controllers/inquiryForm.controller";


const router = express.Router();

router.post(
  "/",
  createNewInquiryData
);

export { router as inquiryFormRoute };

