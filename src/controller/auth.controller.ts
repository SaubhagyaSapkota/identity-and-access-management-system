import { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service";
import { asyncHandler } from "../shared/utils/async.handler";
import {
  ChangePasswordInput,
  ForgetPasswordInput,
  RegisterUserInput,
  ResendEmailVerificationSchema,
  ResetPasswordInput,
  UserLoginInput,
  VerifyEmailInput,
} from "../validators/auth.validator";

export const authController = {
  // controller to register a user
  userRegister: asyncHandler(
    async (
      req: Request<{}, {}, RegisterUserInput["body"], {}>,
      res: Response
    ) => {
      const user = await authService.registerUser(req.body);
      res.status(201).json({ message: "User registered successfully", user });
    }
  ),

  // controller to login a user
  userLogin: asyncHandler(
    async (req: Request<{}, {}, UserLoginInput["body"], {}>, res: Response) => {
      const { email, password } = req.body;
      const { accessToken, refreshToken } = await authService.loginUser(
        email,
        password
      );

      // Store refresh token in HttpOnly cookie
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(200).json({
        message: "User logged in successfully",
        accessToken,
      });
    }
  ),

  // controller to logout a user
  userLogout: asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      throw new Error("User already logged out");
    }

    await authService.logoutUser(refreshToken);

    // Clear cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    res.status(200).json({ message: "User logged out successfully" });
  }),

  // controller for forget password
  forgetPassword: asyncHandler(
    async (
      req: Request<{}, {}, ForgetPasswordInput["body"], {}>,
      res: Response
    ) => {
      const { email } = req.body;

      const { success } = await authService.forgetPassword(email);

      res.status(200).json({
        message: "Reset password email sent. Please check your inbox.",
        success,
      });
    }
  ),

  // controller for forget password
  resetPassword: asyncHandler(
    async (
      req: Request<{}, {}, ResetPasswordInput["body"], {}>,
      res: Response
    ) => {
      const { email, newPassword, verificationToken } = req.body;

      const result = await authService.resetPassword(
        email,
        newPassword,
        verificationToken
      );

      res.status(200).json({
        message: "Password reset successfully",
        result,
      });
    }
  ),

  // controller for email verification
  userEmailVerification: asyncHandler(
    async (
      req: Request<{}, {}, VerifyEmailInput["body"], {}>,
      res: Response
    ) => {
      const { email, token } = req.body;

      if (!token) {
        throw new Error("Verification Token is required");
      }

      const result = await authService.verifyEmail(token, email);

      res
        .status(200)
        .json({ message: "Email verified successfully", data: result });
    }
  ),

  // controller for resending verification email
  resendVerificationEmail: asyncHandler(
    async (
      req: Request<{}, {}, ResendEmailVerificationSchema["body"], {}>,
      res: Response
    ) => {
      const { email } = req.body;

      const result = await authService.resendVerificationEmail(email);

      res.status(200).json({
        message: "Verification email resent successfully",
        data: result,
      });
    }
  ),

  // controller to change password
  userChangePassword: asyncHandler(
    async (
      req: Request<{}, {}, ChangePasswordInput["body"], {}>,
      res: Response
    ) => {
      const { oldPassword, newPassword } = req.body;

      const userId = req.user?.userId;
      if (!userId) throw new Error("User not logged in");

      const result = await authService.changePassword(
        userId,
        oldPassword,
        newPassword
      );

      res
        .status(200)
        .json({ message: "Password changed successfully", result });
    }
  ),

  // controller to change password
  refreshAccessToken: asyncHandler(async (req: Request, res: Response) => {
    const oldRefreshToken = req.cookies.refreshToken;
    if (!oldRefreshToken) throw new Error("Refresh token is missing");

    const { accessToken, refreshToken: newRefreshToken } =
      await authService.refreshAccessToken(oldRefreshToken);

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      accessToken,
    });
  }),
};
