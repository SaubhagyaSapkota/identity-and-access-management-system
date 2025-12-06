import express from "express";
import { adminController } from "../../controller/admin.controller";

const adminRouter = express.Router();

/**
 * Important concept to be added.
 * 1) Audit Logging system
 * 2) Device and IP tracking
 * 3) Rate limiting and Brute Force
 */

/**
 * @route   GET /api/iam/admin
 * @desc    get all users
 * @access  Admin only
 */
adminRouter.get("/", adminController.allUsers);

/**
 * An admin requires a lot of routes to manage the system.
 * It takes time to build all of them.
 * So, route for admin will be expanded with time.
 */
export default adminRouter;
