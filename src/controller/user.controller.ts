import { Request, Response } from "express";
import { asyncHandler } from "../shared/utils/async.handler";

export const userController = {
  // controller to create a post
  createPost: asyncHandler(async (req: Request, res: Response) => {}),

  // controller to create a post
  updatePost: asyncHandler(async (req: Request, res: Response) => {}),

  // controller to create a post
  getAllPost: asyncHandler(async (req: Request, res: Response) => {}),

  // controller to create a post
  getPostById: asyncHandler(async (req: Request, res: Response) => {}),

  // controller to create a post
  deletePost: asyncHandler(async (req: Request, res: Response) => {}),
};
