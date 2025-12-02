import express from "express";
import authRouter from "./auth/auth.route";
import adminRouter from "./admin/admin.route";
import postRouter from "./post/post.route";
import createPlatformSecurity from "middleware/security.middleware";

const router = express.Router();

router.use("/auth", authRouter);
router.use(
  "/admin",
  createPlatformSecurity.authenticatePlatfromAdmin,
  adminRouter
);
router.use(
  "/post",
  createPlatformSecurity.authenticatePlatfromUser,
  postRouter
);

export default router;
