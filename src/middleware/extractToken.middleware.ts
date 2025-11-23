import { Request, Response, NextFunction } from "express";

export const extractRefreshToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(400).json({ message: "Authorization header missing" });
  }

  const refreshToken = authHeader.split(" ")[1];

  if (!refreshToken) {
    return res
      .status(400)
      .json({ message: "Invalid Authorization header format" });
  }

  (req as any).refreshToken = refreshToken;

  next();
};
