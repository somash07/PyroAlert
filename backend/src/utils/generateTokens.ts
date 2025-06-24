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

function generateAccessToken(user: TokenPropsUser): string {
  const secret = process.env.ACCESS_TOKEN_SECRET;
  if (!secret) throw new Error("ACCESS_TOKEN_SECRET must be defined");

  const payload: JwtPayload = {
    _id: user._id,
    username: user.username,
    email: user.email,
    type: user.type,
    isVerified: user.isVerified,
  };

  const options: SignOptions = {
    expiresIn: "1d",
  };

  return jwt.sign(payload, secret, options);
}

function generateRefreshToken(user: TokenPropsUser): string {
  const secret = process.env.REFRESH_TOKEN_SECRET;
  if (!secret) throw new Error("REFRESH_TOKEN_SECRET must be defined");

  const payload: JwtPayload = {
    _id: user._id,
  };

  const options: SignOptions = {
    expiresIn: "7d",
  };

  return jwt.sign(payload, secret, options);
}

const generateAccessAndRefreshTokens = async (
  user: TokenPropsUser
): Promise<{ accessToken: string; refreshToken: string }> => {
  const userFound = await User.findById(user._id).lean(); // ✅ ensures it's a plain object

  if (!userFound) {
    throw new Error("User not found");
  }

  const cleanUser: TokenPropsUser = {
    _id: userFound._id.toString(),
    username: userFound.username,
    email: userFound.email,
    type: userFound.type,
    isVerified: userFound.isVerified,
  };

  const accessToken = generateAccessToken(cleanUser);
  const refreshToken = generateRefreshToken(cleanUser);

  return { accessToken, refreshToken };
};

export {
  generateAccessToken,
  generateRefreshToken,
  generateAccessAndRefreshTokens,
};
