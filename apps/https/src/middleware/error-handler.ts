import type { Request, Response, NextFunction } from "express";
import { AppError, ValidationError } from "../utils/errors.js";
import multer from "multer";

/**
 * Global error handler — catches all thrown errors and sends consistent JSON.
 * Must be registered LAST in the Express middleware chain.
 */
export function globalErrorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Multer errors (file too large, wrong type, etc.)
  if (err instanceof multer.MulterError) {
    const messages: Record<string, string> = {
      LIMIT_FILE_SIZE: "File is too large",
      LIMIT_FILE_COUNT: "Too many files",
      LIMIT_UNEXPECTED_FILE: "Unexpected file field",
    };
    res.status(400).json({
      error: "FILE_UPLOAD_ERROR",
      message: messages[err.code] || `Upload error: ${err.message}`,
    });
    return;
  }

  // Multer file filter errors (thrown as plain Error)
  if (err.message && (
    err.message.includes("Only PNG, JPEG, GIF, and WebP") ||
    err.message.includes("File type") ||
    err.message.includes("not allowed")
  )) {
    res.status(400).json({
      error: "FILE_UPLOAD_ERROR",
      message: err.message,
    });
    return;
  }

  // Known app errors
  if (err instanceof ValidationError) {
    res.status(err.statusCode).json({
      error: err.code,
      message: err.message,
      errors: err.errors,
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.code,
      message: err.message,
    });
    return;
  }

  // Unknown errors — log and send generic message
  console.error("[ERROR]", err);
  res.status(500).json({
    error: "INTERNAL_SERVER_ERROR",
    message:
      process.env.NODE_ENV === "production"
        ? "Something went wrong"
        : err.message,
  });
}
