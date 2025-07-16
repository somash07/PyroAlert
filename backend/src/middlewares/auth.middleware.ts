import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model";
import dotenv from "dotenv";

dotenv.config();

export interface AuthRequest extends Request {
  user?: any;
}


const authenticateWithJwt = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void | Promise<void> => {
  const token =
    req.cookies.accessToken || req.headers.authorization?.split(" ")[1];

  if (!token) {
     res.status(400).json({
      success: false,
      message: "Invalid Token",
    });
    return;
  }

  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET as string,
    async (err: any, token: any) => {
      if (err) {
        return res.status(400).json({
          message: "Something went wrong while verifying token",
          success: false,
        });
      }
      try {
        const user = await User.findById({ _id: token?._id }).select(
          "-password -refreshToken -verifyCode -verifyCodeExpiry"
        );
        if (!user) {
          return res.status(404).json({ message: "User not found." });
        }

        (req as any).user = user;
        next();
      } catch (error) {
        return res.status(500).json({
          message: "Internal Server Error",
          success: false,
        });
      }
    }
  );
};

const authorize = (types: string[]) : any => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!types.includes(req.user.type)) {
      return res.status(500).json({
        message: "Invalid Role",
        success: false,
      });
    }
    next();
  };
};

export { authenticateWithJwt, authorize };
