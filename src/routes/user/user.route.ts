import { userController } from "controller/user.controller";
import express from "express";

const userRouter = express.Router();

/**
 * @route   POST /api/v1/user/create
 * @desc    Create a new post
 * @access  Users
 */
userRouter.post("/create", userController.createPost);

/**
 * @route   PUT /api/v1/user/update
 * @desc    Update the post
 * @access  Users
 */
userRouter.put("/update/:id", userController.updatePost);

/**
 * @route   GET /api/v1/user
 * @desc    View all post
 * @access  Users
 */
userRouter.get("/", userController.getAllPost);

/**
 * @route   GET /api/v1/user/:id
 * @desc    View a single post
 * @access  Users
 */
userRouter.get("/:id", userController.getPostById);

/**
 * @route   DELETE /api/v1/user/delete
 * @desc    Delete a post
 * @access  Users
 */
userRouter.post("/delete/:id", userController.deletePost);

export default userRouter;
