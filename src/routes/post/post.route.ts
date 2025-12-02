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
  checkPermission("create_post"),
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
  checkPermission("update_post"),
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
  checkPermission("delete_post"),
  validateRequest(deletePostValidator),
  postController.deletePost
);

/**
 * @route   GET /api/iam/post
 * @desc    View all post
 * @access  Users
 */
postRouter.get("/", checkPermission("read_post"), postController.getAllPost);

/**
 * @route   GET /api/iam/post/:id
 * @desc    View a single post
 * @access  Users
 */
postRouter.get(
  "/:postId",
  validateRequest(getPostByIdValidator),
  checkPermission("read_post"),
  postController.getPostById
);

export default postRouter;
