import express from "express";
import { JwtPayload } from "jsonwebtoken";
import { UserPayload } from "./userPayload";

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

// to make the file a module and avoid the TypeScript error
export {};
