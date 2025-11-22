import express from "express";
import { authController } from "../../controller/auth.controller";
import {
  registerUserValidator,
  // verifyEmailSchema,
} from "../../validators/auth.validator";
import { validateRequest } from "../../middleware/validation.middleware";

const authRouter = express.Router();

/**
 * @route   GET /api/iam/auth
 * @desc    get all users
 * @access  Admin only
 */
authRouter.get("/", authController.allUsers);

/**
 * @route   POST /api/v1/auth/register
 * @desc    Submit a register request
 * @access  Public (for registration)
 */
authRouter.post(
  "/register",
  validateRequest(registerUserValidator),
  authController.userRegister
);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Submit a login request
 * @access  User
 */
authRouter.post("/login", authController.userLogin);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Submit a logout request
 * @access  User
 */
authRouter.post("/logout", authController.userLogout);

/**
 * @route   POST /api/v1/auth/emailVerify
 * @desc    Submit a email verify request
 * @access  User 
 */ authRouter.post(
  "/emailVerify",
  // validateRequest(verifyEmailSchema),
  authController.userEmailVerification
);

/**
 * @route   POST /api/iam/auth/changePassword
 * @desc    Submit a change password request
 * @access  User
 */
authRouter.post("/changePassword", authController.userChangePassword);

export default authRouter;
