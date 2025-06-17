import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import dotenv from "dotenv";
import { User } from "../models/user.model";

dotenv.config();

export interface TokenPropsUser {
  _id: string;
  username: string;
  email: string;
  type: string;
  isVerified: boolean;
}

function generateAccessToken(payload: JwtPayload): string {
  const secret = process.env.ACCESS_TOKEN_SECRET;
  if (!secret) throw new Error("ACCESS_TOKEN_SECRET must be defined");

  const options: SignOptions = {
    expiresIn: "1d",
  };

  return jwt.sign(payload, secret, options);
}

function generateRefreshToken(payload: JwtPayload): string {
  const secret = process.env.REFRESH_TOKEN_SECRET;
  if (!secret) throw new Error("REFRESH_TOKEN_SECRET must be defined");

  const options: SignOptions = {
    expiresIn: "7d",
  };

  return jwt.sign(payload, secret, options);
}

const generateAccessAndRefreshTokens = async (
  user: TokenPropsUser
): Promise<{ accessToken: string; refreshToken: string }> => {
  const userFound = await User.findById({ _id: user._id });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return { accessToken, refreshToken };
};

export {
  generateAccessToken,
  generateRefreshToken,
  // generateAccessAndRefreshTokens,
};
