import { Request, Response } from "express";
import { adminService } from "../services/admin.service";
import { asyncHandler } from "../utils/async.handler";

export const adminController = {
  // controller to get all user
  allUsers: asyncHandler(
    async (req: Request<{}, {}, {}, {}>, res: Response) => {
      const users = await adminService.allUsers(req.query);
      res.status(200).json({ message: "All users Fetched successfully", users });
    }
  ),
};
