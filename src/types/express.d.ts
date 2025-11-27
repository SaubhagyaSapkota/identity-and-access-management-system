// eslint-disable-next-line @typescript-eslint/no-unused-vars
import express from "express";

declare global {
  namespace Express {
    export interface Request {
      user?: {
        userId: string;
        email: string;
        refreshToken?: string;
      };
    }
  }
}

// to make the file a module and avoid the TypeScript error
export {};
