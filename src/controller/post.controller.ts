import { Request, Response } from "express";
import { asyncHandler } from "../shared/utils/async.handler";
import { postService } from "../services/post.service";
import {
  CreatePostInput,
  DeletePostInput,
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
      const createdPost = await postService.createPost(req.body, user.userId, uploadedFiles);

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
    ) => {}
  ),

  // controller to create a post
  getAllPost: asyncHandler(async (req: Request, res: Response) => {}),

  // controller to create a post
  getPostById: asyncHandler(async (req: Request, res: Response) => {}),

  // controller to create a post
  deletePost: asyncHandler(
    async (
      req: Request<{}, {}, DeletePostInput["params"], {}>,
      res: Response
    ) => {}
  ),
};
