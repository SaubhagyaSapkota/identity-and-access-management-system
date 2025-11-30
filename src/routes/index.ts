import express from "express";
import authRouter from "./auth/auth.route";
import adminRouter from "./admin/admin.route";
import postRouter from "./post/post.route";
import { authenticateUser } from "middleware/authUser.middleware";

const router = express.Router();

router.use("/auth", authRouter);
router.use("/admin", adminRouter);
router.use("/post", authenticateUser, postRouter);

export default router;
