// import jwt from "jsonwebtoken";
// import { Request, Response, NextFunction } from "express";

// export const authenticateUser = (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const authHeader = req.headers.authorization;

//   if (!authHeader) {
//     return res.status(401).json({ message: "Access token missing" });
//   }

//   const accessToken = authHeader.split(" ")[1];

//   if (!accessToken) {
//     return res.status(401).json({ message: "Access token missing" });
//   }

//   try {
//     const decoded = jwt.verify(
//       accessToken,
//       process.env.JWT_SECRET!
//     ) as jwt.JwtPayload;

//     req.user = {
//       userId: decoded.userId,
//       email: decoded.email,
//       token: accessToken,
//     };

//     next();
//   } catch (error) {
//     return res.status(403).json({ message: "Invalid or expired access token" });
//   }
// };


import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import redis from "../database/connections/redis.connection";
import { sessionRepository } from "../database/repositories/session.repository";


export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access token missing" });
  }

  const accessToken = authHeader.split(" ")[1];

  if (!accessToken) {
    return res.status(401).json({ message: "Access token missing" });
  }

  try {
    // 1. Verify JWT signature and expiration
    const decoded = jwt.verify(
      accessToken,
      process.env.JWT_SECRET!
    ) as jwt.JwtPayload;

    const { userId, jti, email } = decoded;

    if (!jti) {
      return res.status(403).json({ message: "Invalid token format" });
    }

    // 2. Check if token is blacklisted
    const isBlacklisted = await redis.get(`blacklist:${jti}`);
    if (isBlacklisted) {
      return res.status(403).json({
        message: "Token has been revoked. Please login again.",
      });
    }

    // 3. Check Redis cache (fast path)
    const cachedSession = await redis.get(`session:${userId}:${jti}`);

    if (cachedSession) {
      // Session exists in cache - fast path
      const sessionData = JSON.parse(cachedSession);
      req.user = {
        userId: sessionData.userId,
        email: sessionData.email,
        jti,
        accessToken,
      };
      return next();
    }

    // 4. Check database (slow path - cache miss)
    const session = await sessionRepository.findSessionByJti(jti);

    if (!session) {
      return res.status(403).json({
        message: "Session not found or expired. Please login again.",
      });
    }

    // 5. Repopulate Redis cache
    const sessionData = {
      userId: session.user_id,
      email: email,
      jti,
      createdAt: session.created_at,
    };

    await redis.setex(
      `session:${userId}:${jti}`,
      15 * 60, // 15 minutes
      JSON.stringify(sessionData)
    );

    // 6. Attach user to request
    req.user = {
      userId: session.user_id,
      email: email,
      jti,
      accessToken,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        message: "Access token expired. Please refresh your token.",
      });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(403).json({
        message: "Invalid access token",
      });
    }

    console.error("Authentication error:", error);
    return res.status(500).json({
      message: "Authentication failed",
    });
  }
};