import { Request, Response, NextFunction } from "express";
import { authService } from "../service/auth.service";


// controller to register a user
export const userRegister = async (req: Request, res: Response) => {
  try {
    const user = await authService.registerUser(req.body);
    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(400).json({ message: "Registration Failed." });
  }
};

// controller to login a user
export const userLogin = async (
  req: Request,
  res: Response,
) => {
  try {
  } catch (error) {}
};

// controller to logout a user
export const userLogout = async (
  req: Request,
  res: Response,
) => {
  try {
  } catch (error) {}
};

// controller to change password
export const userChangePassword = async (
  req: Request,
  res: Response,
) => {
  try {
  } catch (error) {}
};

// controller for email verification
export const userEmailVerification = async (
  req: Request,
  res: Response,
) => {
  try {
  } catch (error) {}
};
