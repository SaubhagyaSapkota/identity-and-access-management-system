import express from "express";
import { adminController } from "../../controller/admin.controller";

const adminRouter = express.Router();

/**
 * @route   GET /api/iam/admin
 * @desc    get all users
 * @access  Admin only
 */
adminRouter.get("/", adminController.allUsers);

export default adminRouter;
