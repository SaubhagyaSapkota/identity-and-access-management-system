import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { Request, Response, NextFunction } from "express";


export interface UploadedFile {
  filename: string;
  path: string;
  url: string;
  originalName: string;
  mimeType: string;
  size: number;
}

// Ensure upload directory exists
const uploadDir = "./uploads/posts";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-randomhash-originalname
    const uniqueSuffix = `${Date.now()}-${crypto
      .randomBytes(6)
      .toString("hex")}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

// File filter for validation
const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Allowed MIME types
  const allowedImageTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];
  const allowedPdfType = "application/pdf";

  const isImage = allowedImageTypes.includes(file.mimetype);
  const isPdf = file.mimetype === allowedPdfType;

  if (isImage || isPdf) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type: ${file.mimetype}. Only images and PDFs are allowed.`
      )
    );
  }
};

// Multer instance
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max per file
    files: 10, // Max 10 files total
  },
});

// Middleware to process uploaded files and attach to req.uploadedFiles
export const uploadPostFiles = [
  upload.array("files", 10),
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "At least one file is required",
        });
      }

      // Check if files are mixed (images + PDF)
      const hasPdf = files.some((f) => f.mimetype === "application/pdf");
      const hasImages = files.some((f) => f.mimetype.startsWith("image/"));

      // Business rule: Either multiple images OR one PDF, not both
      if (hasPdf && hasImages) {
        // Clean up uploaded files
        files.forEach((file) => fs.unlinkSync(file.path));

        return res.status(400).json({
          success: false,
          message:
            "Cannot upload both images and PDF together. Choose either multiple images or one PDF.",
        });
      }

      // Only one PDF allowed
      if (hasPdf && files.length > 1) {
        files.forEach((file) => fs.unlinkSync(file.path));

        return res.status(400).json({
          success: false,
          message: "Only one PDF file is allowed per post",
        });
      }

      // Max 10 images
      if (hasImages && files.length > 10) {
        files.forEach((file) => fs.unlinkSync(file.path));

        return res.status(400).json({
          success: false,
          message: "Maximum 10 images allowed per post",
        });
      }

      // Attach formatted file info to request
      req.uploadedFiles = files.map((file) => ({
        filename: file.filename,
        path: file.path,
        url: `/uploads/posts/${file.filename}`,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      }));

      next();
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "File upload processing failed",
      });
    }
  },
];

// Error handler for multer errors
export const handleMulterError = (err: any, req: any, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    let message = err.message;

    switch (err.code) {
      case "LIMIT_FILE_SIZE":
        message = "File size too large. Maximum size is 10MB per file.";
        break;
      case "LIMIT_FILE_COUNT":
        message = "Too many files. Maximum 10 files allowed.";
        break;
      case "LIMIT_UNEXPECTED_FILE":
        message = 'Unexpected field name. Use "files" as the field name.';
        break;
    }

    return res.status(400).json({
      success: false,
      message,
    });
  }

  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || "File upload failed",
    });
  }

  next();
};
