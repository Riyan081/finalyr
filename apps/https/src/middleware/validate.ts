import type { Request, Response, NextFunction } from "express";
import { z, type ZodSchema } from "zod";
import { ValidationError } from "../utils/errors.js";

/**
 * Validate request body against a Zod schema.
 * Throws ValidationError with field-level errors on failure.
 */
export function validateBody(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors: Record<string, string[]> = {};
      for (const issue of result.error.issues) {
        const key = issue.path.join(".");
        if (!errors[key]) errors[key] = [];
        errors[key].push(issue.message);
      }
      throw new ValidationError(errors);
    }
    req.body = result.data;
    next();
  };
}

/**
 * Validate query params against a Zod schema.
 */
export function validateQuery(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const errors: Record<string, string[]> = {};
      for (const issue of result.error.issues) {
        const key = issue.path.join(".");
        if (!errors[key]) errors[key] = [];
        errors[key].push(issue.message);
      }
      throw new ValidationError(errors);
    }
    // Express 5 freezes req.query — store parsed data separately
    (req as any).validatedQuery = result.data;
    next();
  };
}

/**
 * Validate URL params against a Zod schema.
 */
export function validateParams(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      const errors: Record<string, string[]> = {};
      for (const issue of result.error.issues) {
        const key = issue.path.join(".");
        if (!errors[key]) errors[key] = [];
        errors[key].push(issue.message);
      }
      throw new ValidationError(errors);
    }
    next();
  };
}
