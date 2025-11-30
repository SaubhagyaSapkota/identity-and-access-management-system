import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import type { Request, Response, NextFunction } from "express";

export interface UploadedFile {
  filename: string;
  path: string;
  url: string;
  originalName: string;
  mimeType: string;
  size: number;
}

const UPLOAD_DIR = "./uploads/posts";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 10;

// Ensure upload directory exists
const ensureUploadDir = () => {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
};

ensureUploadDir();

// Creating multer storage configuration
const createStorage = (): multer.StorageEngine => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${crypto
        .randomBytes(6)
        .toString("hex")}`;
      const ext = path.extname(file.originalname);
      const sanitizedName = path
        .basename(file.originalname, ext)
        .replace(/[^a-zA-Z0-9]/g, "_");
      cb(null, `${sanitizedName}-${uniqueSuffix}${ext}`);
    },
  });
};

const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}`));
  }
};

const validateFiles = (req: Request, res: Response, next: NextFunction) => {
  const files = req.files as Express.Multer.File[];

  if (!files || files.length === 0) {
    return res.status(400).json({
      success: false,
      message: "At least one file is required",
    });
  }

  const hasPdf = files.some((f) => f.mimetype === "application/pdf");
  const hasImages = files.some((f) => f.mimetype.startsWith("image/"));

  if (hasPdf && hasImages) {
    files.forEach((file) => fs.unlinkSync(file.path));
    return res.status(400).json({
      success: false,
      message: "Cannot upload both images and PDF together",
    });
  }

  if (hasPdf && files.length > 1) {
    files.forEach((file) => fs.unlinkSync(file.path));
    return res.status(400).json({
      success: false,
      message: "Only one PDF file is allowed",
    });
  }

  req.uploadedFiles = files.map((file) => ({
    filename: file.filename,
    path: file.path,
    url: `/uploads/posts/${file.filename}`,
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
  }));

  next();
};

const handleMulterError = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof multer.MulterError) {
    let message = err.message;

    switch (err.code) {
      case "LIMIT_FILE_SIZE":
        message = "File size too large. Maximum 10MB per file.";
        break;
      case "LIMIT_FILE_COUNT":
        message = "Too many files. Maximum 10 files allowed.";
        break;
      case "LIMIT_UNEXPECTED_FILE":
        message = 'Unexpected field name. Use "files" as the field name.';
        break;
    }

    return res.status(400).json({ success: false, message });
  }

  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || "File upload failed",
    });
  }

  next();
};

// Main upload middleware function
export const uploadPostFiles = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const upload = multer({
    storage: createStorage(),
    fileFilter: fileFilter,
    limits: {
      fileSize: MAX_FILE_SIZE,
      files: MAX_FILES,
    },
  }).array("files", MAX_FILES);

  upload(req, res, (err) => {
    if (err) {
      return handleMulterError(err, req, res, next);
    }

    validateFiles(req, res, next);
  });
};