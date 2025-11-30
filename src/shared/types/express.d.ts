// eslint-disable-next-line @typescript-eslint/no-unused-vars
import express from "express";
import { UserPayload } from "./userPayload";
import { UploadedFile } from "middleware/file-upload.middleware";

declare global {
  namespace Express {
    export interface Request {
      user?: UserPayload;
      uploadedFiles?: UploadedFile[] | Record<string, UploadedFile[]>;
    }
  }
}

// to make the file a module and avoid the TypeScript error
export {};
