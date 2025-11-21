import express from "express";
import { authController } from "../../controller/auth.controller";
import { registerUserValidator } from "../../validators/auth.validator";
import { validateRequest } from "../../middleware/validation.middleware";

const authRouter = express.Router();

authRouter.get("/",authController.allUsers);
authRouter.post(
  "/register",
  validateRequest(registerUserValidator),
  authController.userRegister
);
authRouter.post("/login", authController.userLogin);
authRouter.post("/logout", authController.userLogout);
authRouter.post("/emailVerify", authController.userEmailVerification);
authRouter.post("/changePassword", authController.userChangePassword);

export default authRouter;
