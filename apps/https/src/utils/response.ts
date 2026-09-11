import type { Response } from "express";

/**
 * Standardized success response helper.
 */
export function sendSuccess<T>(
  res: Response,
  message: string,
  data?: T,
  statusCode = 200,
  pagination?: object
): void {
  const response: any = { success: true, message, data };
  if (pagination) response.pagination = pagination;
  res.status(statusCode).json(response);
}

/**
 * Standardized error response helper.
 */
export function sendError(
  res: Response,
  error: string,
  statusCode = 400
): void {
  res.status(statusCode).json({ success: false, error });
}
