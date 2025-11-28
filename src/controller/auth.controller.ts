import { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service";
import { asyncHandler } from "../utils/async.handler";
import {
  ChangePasswordInput,
  ForgetPasswordInput,
  RegisterUserInput,
  ResendEmailVerificationSchema,
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
      const user = await authService.loginUser(email, password);
      res.status(200).json({ message: "User logged in successfully", user });
    }
  ),

  // controller to logout a user
  userLogout: asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.user?.tokenId;

    await authService.logoutUser(refreshToken);
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

      res
        .status(200)
        .json({ message: "Email verified successfully", data: result });
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
};
