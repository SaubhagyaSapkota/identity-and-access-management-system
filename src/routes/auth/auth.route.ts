import express from "express";
import {
  userRegister,
  userChangePassword,
  userLogin,
  userEmailVerification,
  userLogout,
} from "../../controller/auth.controller";

const authRouter = express.Router();

authRouter.post("/register", userRegister);
authRouter.post("/login", userLogin);
authRouter.post("/logout", userLogout);
authRouter.post("/emailVerify", userEmailVerification);
authRouter.post("/changePassword", userChangePassword);

export default authRouter;
