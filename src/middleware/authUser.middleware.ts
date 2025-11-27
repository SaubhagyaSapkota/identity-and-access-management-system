import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export const authenticateUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Access token missing" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload;

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      tokenId: decoded.tokenId,
    };

    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired access token" });
  }
};
