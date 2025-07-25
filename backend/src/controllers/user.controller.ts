import { CookieOptions, Request, Response } from "express";
import { User, UserType } from "../models/user.model";
import bcrypt from "bcryptjs";
import { ApiResponse } from "../types/apiResponse";
import { signupSchema } from "../validators/signup.validators";
import { signinSchema } from "../validators/signin.validators";
import {
  TokenPropsUser,
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateTokens";
import { verifySchema } from "../validators/verify-code.validators";
import asyncHandler from "../utils/asyncHandeler";
import { sendCode } from "../utils/sendCode";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { maileType } from "../types/mailType";
import { AuthRequest } from "../middlewares/auth.middleware";
dotenv.config();

const options: CookieOptions = {
  httpOnly: true,
  secure: true,
};

const signUpHandler = asyncHandler(
  async (
    req: Request,
    res: Response<ApiResponse>
  ): Promise<Response<ApiResponse>> => {
    let { username, email, password, type, location } = req.body;
    const { lat, lng } = location;

    // Default to "Firedepartment" if not provided
    if (!type) {
      type = UserType.Firedepartment;
    }
    const validationResult = signupSchema.safeParse({
      username,
      email,
      password,
      type,
      location: {
        lat,
        lng,
      },
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

    if (!username || !email || !password || !type || !lat || !lng) {
      return res.status(400).json({
        success: false,
        message: "Some field is missing here",
      });
    }

    if (!Object.values(UserType).includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user type",
      });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedPassword = await bcrypt.hash(password, 10);

    if (existingUser) {
      if (existingUser.isVerified) {
        return res.status(409).json({
          success: false,
          message: "User already exists",
        });
      } else {
        existingUser.username = username;
        existingUser.email = email;
        existingUser.password = hashedPassword;
        existingUser.verifyCode = verifyCode;
        existingUser.verifyCodeExpiry = new Date(Date.now() + 3600000);
        (existingUser.location = {
          lat: lat,
          lng: lng,
        }),
          await existingUser.save();

        await sendCode(email, verifyCode, maileType.VERIFY_OTP);

        return res.status(200).json({
          success: true,
          message: "User updated successfully. Verification code sent.",
        });
      }
    } else {
      const verifyCodeExpiry = new Date(Date.now() + 3600000);

      const newUser = new User({
        username,
        email,
        password: hashedPassword,
        type: type || UserType.Firedepartment,
        verifyCode,
        isVerified: false,
        verifyCodeExpiry,
        location: {
          lat: lat,
          lng: lng,
        },
      });

      await newUser.save();

      await sendCode(email, verifyCode, maileType.VERIFY_OTP);

      return res.status(201).json({
        success: true,
        message: "User successfully created. Verification code sent.",
        data: newUser,
      });
    }
  }
);

const signInHandler = asyncHandler(
  async (
    req: Request,
    res: Response<ApiResponse>
  ): Promise<Response<ApiResponse>> => {
    const { identifier, password } = req.body;

    const signInValidationResult = signinSchema.safeParse({
      identifier,
      password,
    });

    if (!signInValidationResult.success) {
      const errors = signInValidationResult.error.errors.map(
        (error) => error.message
      );
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: errors,
      });
    }

    const { data } = signInValidationResult;

    const user = await User.findOne({
      $or: [{ email: data.identifier }, { username: data.identifier }],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      data.password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Account not verified. Please verify your account.",
      });
    }

    const refreshToken = await generateRefreshToken(user as TokenPropsUser);
    const accessToken = await generateAccessToken(user as TokenPropsUser);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    res.cookie("refreshToken", refreshToken, options);
    res.cookie("accessToken", accessToken, options);

    let loggedInUser;
    if (user.type === UserType.Admin) {
      loggedInUser = {
        _id: user._id,
        username: user.username,
        email: user.email,
        type: user.type,
      };
    } else {
      loggedInUser = {
        _id: user._id,
        username: user.username,
        email: user.email,
        type: user.type,
        lat: user.location?.lat,
        lng: user.location?.lng,
      };
    }

    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      data: { user: loggedInUser, refreshToken, accessToken },
    });
  }
);

export const adminLoginHandler = asyncHandler(
  async (req: Request, res: Response<ApiResponse>) => {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: "Email or username and password are required.",
      });
    }

    if (
      identifier !== process.env.ADMIN_EMAIL &&
      identifier !== process.env.ADMIN_USERNAME
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials.",
      });
    }

    const adminUser = await User.findOne({
      $or: [
        { email: process.env.ADMIN_EMAIL },
        { username: process.env.ADMIN_USERNAME },
      ],
    });

    if (!adminUser) {
      return res.status(500).json({
        success: false,
        message: "Admin user not initialized. Please seed the database.",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      adminUser.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Passwords do not match.",
      });
    }

    const refreshToken = await generateRefreshToken(
      adminUser as TokenPropsUser
    );
    const accessToken = await generateAccessToken(adminUser as TokenPropsUser);

    res.cookie("refreshToken", refreshToken, options);
    res.cookie("accessToken", accessToken, options);

    return res.status(200).json({
      success: true,
      message: "Admin logged in successfully",
      data: {
        user: {
          _id: adminUser._id,
          username: adminUser.username,
          email: adminUser.email,
          type: adminUser.type,
        },
        refreshToken,
        accessToken,
      },
    });
  }
);

const codeVerifier = asyncHandler(
  async (req: Request, res: Response<ApiResponse>) => {
    const { username, verifyCode } = req.body;

    const verifyCodeValidation = verifySchema.safeParse({ code: verifyCode });

    if (!verifyCodeValidation.success) {
      return res.status(400).json({
        success: false,
        message: verifyCodeValidation.error.errors[0].message,
      });
    }

    const user = await User.findOne({ username });
    // console.log(user)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User with this username does not exist",
      });
    }

    const isVerifyCodeCorrect = user.verifyCode === verifyCode;
    const isVerifyCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();

    if (isVerifyCodeCorrect && isVerifyCodeNotExpired) {
      user.isVerified = true;

      await user.save();
      return res.status(200).json({
        success: true,
        message: "User verified successfully",
      });
    } else if (!isVerifyCodeCorrect) {
      return res.status(400).json({
        success: false,
        message: "Incorrect Verification Code, Please try again",
      });
    } else if (!isVerifyCodeNotExpired) {
      return res.status(400).json({
        success: false,
        message: "Verification Code Expired, Please Login again",
      });
    }
  }
);

const getVerificationCode = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email, isVerified: true });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User Not Found",
      });
    }
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    user.verifyCode = verifyCode;
    user.verifyCodeExpiry = new Date(Date.now() + 60000);

    await user.save();

    await sendCode(email, verifyCode, maileType.RESET);

    res.status(200).json({
      success: true,
      message: "Verification code has been sent to your email.",
    });
  }
);

const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email, code, newPassword } = req.body;
  if (!email || !code || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  const user = await User.findOne({
    email,
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User with this username cannot be found",
    });
  }

  const isVerifyCodeCorrect = user.verifyCode === code;
  const isVerifyCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();

  if (isVerifyCodeCorrect && isVerifyCodeNotExpired) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "User's password successfully changed",
    });
  } else if (!isVerifyCodeCorrect) {
    return res.status(400).json({
      success: false,
      message: "Incorrect Verification Code, Please try again",
    });
  } else if (!isVerifyCodeNotExpired) {
    return res.status(400).json({
      success: false,
      message: "Verification Code Expired, Please Login again",
    });
  }
});

const logoutUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.refreshToken = undefined;
    await user.save({ validateBeforeSave: false });
  }

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json({ success: true, message: "User logged out successfully" });
});

const refreshAccessToken = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(404).json({
      success: false,
      message: "No Token Available",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.REFRESH_TOKEN_SECRET as string
    ) as jwt.JwtPayload & { _id: string };
    const user = await User.findById(decoded._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Invalid Token",
      });
    }

    if (token !== user.refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Token has Expired",
      });
    }

    const newRefreshToken = await generateRefreshToken(user as TokenPropsUser);
    const accessToken = await generateAccessToken(user as TokenPropsUser);

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    res.cookie("refreshToken", newRefreshToken, options);
    res.cookie("accessToken", accessToken, options);

    const loggedInUser = {
      _id: user._id,
      username: user.username,
      email: user.email,
      type: user.type,
      isVerified: user.isVerified,
    };

    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      data: {
        user: loggedInUser,
        refreshToken: newRefreshToken,
        accessToken,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

// const toggleVolunteerMode = asyncHandler(
//   async (req: AuthRequest, res: Response) => {
//     const { isVolunteer } = req.body;

//     if (typeof isVolunteer !== "boolean") {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid input for volunteer mode",
//       });
//     }

//     const user = await User.findById(req.user._id);

//     if (!user) {
//       return res.status(400).json({
//         success: false,
//         message: "Couldn't update the Volunteer mode",
//       });
//     }

//     user.isVolunteer = isVolunteer;
//     await user.save();

//     res.status(200).json({
//       success: true,
//       message: "User updated successfully",
//       data: "huehuehue",
//     });
//   }
// );

const getAllFireDepartments = async (req: Request, res: Response) => {
  try {
    const departments = await User.find({ type: "Firedepartment" }).select(
      "username email location"
    );
    return res.status(200).json({ success: true, data: departments });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch departments" });
  }
};

export const updateDepartmentSettings = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user._id;
    const { username, email, password, lat, lng } = req.body;

    const department = await User.findById(userId);

    if (!department || department.type !== "Firedepartment") {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    if (username) department.username = username;
    if (email) department.email = email;
    if (lat && lng) department.location = { lat, lng };

    if (password && password.length >= 6) {
      const hashed = await bcrypt.hash(password, 10);
      department.password = hashed;
    }

    await department.save();

    return res.status(200).json({
      success: true,
      message: "Department settings updated successfully",
      data: {
        _id: department._id,
        username: department.username,
        email: department.email,
      },
    });
  }
);

export {
  signUpHandler,
  signInHandler,
  codeVerifier,
  getVerificationCode,
  resetPassword,
  logoutUser,
  refreshAccessToken,
  getAllFireDepartments,
};
