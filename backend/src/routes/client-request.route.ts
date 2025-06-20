import express from "express";
import { createNewClientRequest } from "../controllers/client-request.controller";


const router = express.Router();

router.post(
  "/",
  createNewClientRequest
);

export { router as clientRequestRoute };

