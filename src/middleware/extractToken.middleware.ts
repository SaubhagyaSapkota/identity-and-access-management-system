import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

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

  try {
    const decodedToken = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET!
    ) as jwt.JwtPayload;

    req.user = {
      userId: decodedToken.userId,
      email: decodedToken.email,
      refreshToken,
    };
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid Refresh token" });
  }
};
