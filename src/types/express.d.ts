// eslint-disable-next-line @typescript-eslint/no-unused-vars
import express from "express";
import { UserPayload } from "./userPayload";

declare global {
  namespace Express {
    export interface Request {
      user?: UserPayload;
    }
  }
}

// to make the file a module and avoid the TypeScript error
export {};
