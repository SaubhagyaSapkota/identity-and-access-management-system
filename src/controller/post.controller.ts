import { Request, Response } from "express";
import { asyncHandler } from "../shared/utils/async.handler";
import { postService } from "../services/post.service";
import {
  CreatePostInput,
  DeletePostInput,
  GetPostByIdInput,
  UpdatePostInput,
} from "validators/post.validator";
import { UploadedFile } from "middleware/file-upload.middleware";

export const postController = {
  // controller to create a post
  createPost: asyncHandler(
    async (
      req: Request<{}, {}, CreatePostInput["body"], {}>,
      res: Response
    ) => {
      const user = req.user;
      if (!user) {
        throw new Error("Unauthorized");
      }

      const uploadedFiles = req.uploadedFiles as UploadedFile[];
      const createdPost = await postService.createPost(
        req.body,
        user.userId,
        uploadedFiles
      );

      res.status(201).json({
        success: true,
        message: "Post created successfully",
        data: createdPost,
      });
    }
  ),

  // controller to create a post
  updatePost: asyncHandler(
    async (
      req: Request<UpdatePostInput["params"], {}, UpdatePostInput["body"], {}>,
      res: Response
    ) => {
      const user = req.user;
      if (!user) {
        throw new Error("Unauthorized");
      }
      const uploadedFiles = req.uploadedFiles as UploadedFile[];

      const { postId } = req.params;

      const updatedPost = await postService.updatePost(
        postId,
        req.body,
        user.userId,
        uploadedFiles
      );
      res.status(200).json({
        success: true,
        message: "Post updated successfully",
        data: updatedPost,
      });
    }
  ),

  // controller to create a post
  deletePost: asyncHandler(
    async (
      req: Request<DeletePostInput["params"], {}, {}, {}>,
      res: Response
    ) => {
      const user = req.user;
      if (!user) {
        throw new Error("Unauthorized");
      }
      const { postId } = req.params;
      await postService.deletePost(postId, user.userId);

      res.status(200).json({
        success: true,
        message: "Post deleted successfully",
      });
    }
  ),

  // controller to create a post
  getAllPost: asyncHandler(
    async (req: Request<{}, {}, {}, {}>, res: Response) => {
      const posts = await postService.allPosts();
      res
        .status(200)
        .json({ message: "All posts Fetched successfully", posts });
    }
  ),

  // controller to create a post
  getPostById: asyncHandler(
    async (
      req: Request<GetPostByIdInput["params"], {}, {}, {}>,
      res: Response
    ) => {
      const { postId } = req.params;
      const post = await postService.getPostById(postId);
      if (!post) {
        throw new Error("Post not found");
      }
      res.status(200).json({
        success: true,
        data: post,
      });
    }
  ),
};
