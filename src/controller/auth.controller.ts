import { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service";
import { asyncHandler } from "../utils/async.handler";
import { RegisterUserInput, VerifyEmailInput } from "../validators/auth.validator";

export const authController = {
  // controller to get all user
  allUsers: asyncHandler(
    async (req: Request<{}, {}, {}, {}>, res: Response) => {
      const user = await authService.allUsers(req.query);
      res.status(200).json({ message: "All users Fetched successfully", user });
    }
  ),

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
    async (req: Request<{}, {}, {}, {}>, res: Response) => {}
  ),

  // controller to logout a user
  userLogout: asyncHandler(
    async (req: Request<{}, {}, {}, {}>, res: Response) => {}
  ),

  // controller to change password
  userChangePassword: asyncHandler(
    async (req: Request<{}, {}, {}, {}>, res: Response) => {}
  ),

  // controller for email verification
  userEmailVerification: asyncHandler(
    async (req: Request<{}, {}, VerifyEmailInput['body'], {}>, res: Response) => {
      const {email, token} = req.body;

      if (!token) {
        throw new Error("Verification Token is required");
      }

      const result = await authService.verifyEmail(token, email);

      res
        .status(200)
        .json({ message: "Email verified successfully", data: result });
    }
  ),
};
