import type { Request, Response, NextFunction } from "express";
import { AppError, ValidationError } from "../utils/errors.js";

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

  // Multer errors (e.g. LIMIT_FILE_SIZE)
  if (err.name === "MulterError") {
    res.status(400).json({
      error: "BAD_REQUEST",
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
