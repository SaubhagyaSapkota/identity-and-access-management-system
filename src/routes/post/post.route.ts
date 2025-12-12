import { PERMISSIONS } from "config/default.permission.config";
import { postController } from "controller/post.controller";
import express from "express";
import { checkPermission } from "middleware/checkPermission.middleware";
import { uploadPostFiles } from "middleware/file-upload.middleware";
import { validateRequest } from "middleware/validation.middleware";
import {
  createPostValidator,
  deletePostValidator,
  getPostByIdValidator,
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
  checkPermission(PERMISSIONS.CREATE_POST),
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
  checkPermission(PERMISSIONS.UPDATE_POST),
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
  checkPermission(PERMISSIONS.DELETE_POST),
  validateRequest(deletePostValidator),
  postController.deletePost
);

/**
 * @route   GET /api/iam/post
 * @desc    View all post
 * @access  Users
 */
postRouter.get("/", checkPermission(PERMISSIONS.READ_POST), postController.getAllPost);

/**
 * @route   GET /api/iam/post/:id
 * @desc    View a single post
 * @access  Users
 */
postRouter.get(
  "/:postId",
  validateRequest(getPostByIdValidator),
  checkPermission(PERMISSIONS.READ_POST),
  postController.getPostById
);

export default postRouter;
