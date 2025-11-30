import { postController } from "controller/post.controller";
import { create } from "domain";
import express from "express";
import {
  handleMulterError,
  uploadPostFiles,
} from "middleware/file-upload.middleware";
import { validateRequest } from "middleware/validation.middleware";
import { createPostValidator } from "validators/post.validator";

const postRouter = express.Router();

/**
 * @route   POST /api/v1/post/create
 * @desc    Create a new post
 * @access  Users
 */
postRouter.post(
  "/create",
  ...uploadPostFiles,
  handleMulterError,
  validateRequest(createPostValidator),
  postController.createPost
);

/**
 * @route   PUT /api/v1/post/update
 * @desc    Update the post
 * @access  Users
 */
postRouter.put("/update/:id", postController.updatePost);

/**
 * @route   GET /api/v1/post
 * @desc    View all post
 * @access  Users
 */
postRouter.get("/", postController.getAllPost);

/**
 * @route   GET /api/v1/post/:id
 * @desc    View a single post
 * @access  Users
 */
postRouter.get("/:id", postController.getPostById);

/**
 * @route   DELETE /api/v1/post/delete
 * @desc    Delete a post
 * @access  Users
 */
postRouter.post("/delete/:id", postController.deletePost);

export default postRouter;
