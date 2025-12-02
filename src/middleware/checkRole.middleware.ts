import { Request, Response, NextFunction } from "express";
import { roleRepository } from "../database/repositories/role.repository";

interface CheckRoleOptions {
  hasRole: string[]; // Example: ["admin", "moderator"]
}

export function checkRole(options: CheckRoleOptions) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized: No user found" });
      }

      const userRoles = await roleRepository.getRolesForUser(userId);

      if (!userRoles || userRoles.length === 0) {
        return res
          .status(403)
          .json({ message: "Forbidden: No roles assigned" });
      }

      const hasMatch = userRoles.some((role) => options.hasRole.includes(role));

      if (!hasMatch) {
        return res.status(403).json({
          message: "Forbidden: You do not have required role",
        });
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}
