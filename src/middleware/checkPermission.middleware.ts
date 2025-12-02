import { Request, Response, NextFunction } from "express";
import { roleRepository } from "../database/repositories/role.repository";

export function checkPermission(requiredPermission: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ message: "Unauthenticated" });

      const permissions = await roleRepository.getUserPermissions(userId);

      if (!permissions.includes(requiredPermission)) {
        return res
          .status(403)
          .json({ message: "Forbidden: Permission denied" });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
