import express from "express";
import { authController } from "../../controller/auth.controller";
import {
  changePasswordSchema,
  forgetPasswordSchema,
  registerUserValidator,
  resendEmailVerificationSchema,
  userLoginSchema,
  verifyEmailSchema,
} from "../../validators/auth.validator";
import { validateRequest } from "../../middleware/validation.middleware";
import { extractRefreshToken } from "../../middleware/extractToken.middleware";
import { authenticateUser } from "../../middleware/authUser.middleware";

const authRouter = express.Router();

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
authRouter.post(
  "/login",
  validateRequest(userLoginSchema),
  authController.userLogin
);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Submit a logout request
 * @access  User
 */
authRouter.post("/logout", extractRefreshToken, authController.userLogout);

/**
 * @route   POST /api/iam/auth/forget-password
 * @desc    Submit a forget password request
 * @access  User
 */
authRouter.post(
  "/forget-Password",
  validateRequest(forgetPasswordSchema),
  authController.forgetPassword
);

/**
 * @route   POST /api/v1/auth/verify-email
 * @desc    Submit a email verify request
 * @access  User
 */ authRouter.post(
  "/verify-email",
  validateRequest(verifyEmailSchema),
  authController.userEmailVerification
);

/**
 * @route   POST /api/v1/auth/resend-verification
 * @desc    Re-Submit a email verify request
 * @access  User
 */ authRouter.post(
   "/resend-verification",
   validateRequest(resendEmailVerificationSchema),
   authController.resendVerificationEmail
 );

/**
 * @route   POST /api/iam/auth/change-password
 * @desc    Submit a change password request
 * @access  User
 */
authRouter.post(
  "/change-password",
  authenticateUser,
  validateRequest(changePasswordSchema),
  authController.userChangePassword
);

export default authRouter;
