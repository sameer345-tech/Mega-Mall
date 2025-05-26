import { signupSchema } from "../zodSchemas/signupSchema.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../utils/apiResponse.js";
import User from "../models/userModel.js";
import { emailVerification } from "../services/resend.js";
import { signInSchema } from "../zodSchemas/signInSchema.js";
import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const signUp = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = signupSchema.safeParse(req.body);
    if (!result.success) {
      const error = result.error.issues[0].message;
      return res
        .status(400)
        .json(
          new ApiResponse(false, 400, error || "All credentials are required")
        );
    }

    const { fullName, email, password, confirmPassword } = result.data;

    if (password !== confirmPassword) {
      return res
        .status(400)
        .json(new ApiResponse(false, 400, "Passwords do not match"));
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json(new ApiResponse(false, 400, "User already exists"));
    }

    const user = await User.create({ fullName, email, password });
    if (!user) {
      return res
        .status(201)
        .json(new ApiResponse(false, 400, "Sign-up Failed."));
    }

    const otp = Math.floor(Math.random() * 1000000);
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000);
    user.otp = otp.toString();
    user.otpExpiry = otpExpiry;
    await user.save();

    const emailResponse = await emailVerification(
      user.fullName,
      user.email,
      user.otp
    );
    if (!emailResponse.success) {
      return res
        .status(emailResponse.status)
        .json(
          new ApiResponse(false, emailResponse.status, emailResponse.message)
        );
    }

    return res
      .status(201)
      .json(new ApiResponse(true, 201, "Sign-up successful"));
  }
);

export const signIn = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password }: { email: string; password: string } = req.body;
    const result = signInSchema.safeParse({ email, password });
    if (!result.success) {
      res
        .status(400)
        .json(
          new ApiResponse(
            false,
            400,
            result.error.issues[0].message || "All credentials are required"
          )
        );
    }
    const unverifiedUser = await userModel.findOne({
      email,
      isVerified: false,
    });
    if (!unverifiedUser) {
      return res
        .status(400)
        .json(new ApiResponse(false, 400, "User not found"));
    }

    if (unverifiedUser) {
      const otp = Math.floor(Math.random() * 1000000);
      const otpExpiry = new Date(Date.now() + 15 * 60 * 1000);
      unverifiedUser.otp = otp.toString();
      unverifiedUser.otpExpiry = otpExpiry;
      await unverifiedUser.save();

      const emailResponse = await emailVerification(
        unverifiedUser.fullName,
        email,
        unverifiedUser.otp
      );
      if (!emailResponse.success) {
        return res
          .status(emailResponse.status)
          .json(
            new ApiResponse(
              false,
              emailResponse.status,
              emailResponse.message ||
                "Something went wrong during email verification"
            )
          );
      }

      return res
        .status(200)
        .json(
          new ApiResponse(
            true,
            200,
            "Verification code sent successfully to your email. Please verify your email"
          )
        );
    }

    const verifiedUser = await userModel.findOne({ email, isVerified: true });
    if (!verifiedUser) {
      return res
        .status(400)
        .json(new ApiResponse(false, 400, "User not found"));
    }

    const isValidPassword = await bcrypt.compare(
      password,
      verifiedUser.password
    );
    if (!isValidPassword) {
      return res
        .status(400)
        .json(new ApiResponse(false, 400, "Invalid password"));
    }
    const JWT_SECRET = process.env.JWT_SECRET;
    const token = jwt.sign(
      {
        _id: verifiedUser._id,
        email: verifiedUser.email,
        fullName: verifiedUser.fullName,
        isVerified: verifiedUser.isVerified,
      },
      JWT_SECRET as string,
      { expiresIn: "1h" }
    );
    const options = {
      httpOnly: true,
      secure: true,
    };
    return res
      .status(200)
      .cookie("Token", token, options)
      .json(new ApiResponse(true, 200, "Sign-in successfully."));
  }
);
