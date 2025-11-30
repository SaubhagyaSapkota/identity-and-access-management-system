import { postController } from "controller/post.controller";
import { create } from "domain";
import express from "express";
import { uploadPostFiles } from "middleware/file-upload.middleware";
import { validateRequest } from "middleware/validation.middleware";
import {
  createPostValidator,
  deletePostValidator,
  updatePostValidator,
} from "validators/post.validator";

const postRouter = express.Router();

/**
 * @route   POST /api/iam/post/
 * @desc    Create a new post
 * @access  Users
 */
postRouter.post(
  "/",
  uploadPostFiles,
  validateRequest(createPostValidator),
  postController.createPost
);

/**
 * @route   PUT /api/iam/post/:postId
 * @desc    Update the post
 * @access  Users
 */
postRouter.put(
  "/:postId",
  uploadPostFiles,
  validateRequest(updatePostValidator),
  postController.updatePost
);

/**
 * @route   DELETE /api/iam/post/:postId
 * @desc    Delete a post
 * @access  Users
 */
postRouter.delete(
  "/:postId",
  validateRequest(deletePostValidator),
  postController.deletePost
);

/**
 * @route   GET /api/iam/post
 * @desc    View all post
 * @access  Users
 */
postRouter.get("/", postController.getAllPost);

/**
 * @route   GET /api/iam/post/:id
 * @desc    View a single post
 * @access  Users
 */
postRouter.get("/:postId", postController.getPostById);

export default postRouter;
