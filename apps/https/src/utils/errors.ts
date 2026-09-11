/**
 * Typed error classes for consistent API error responses.
 * Use these in controllers — the global error handler formats them.
 */

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(message: string, statusCode: number, code: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = "Resource") {
    super(`${resource} not found`, 404, "NOT_FOUND");
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "You don't have permission to do this") {
    super(message, 403, "FORBIDDEN");
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = "Invalid request") {
    super(message, 400, "BAD_REQUEST");
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Authentication required") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class ConflictError extends AppError {
  constructor(message: string = "Resource already exists") {
    super(message, 409, "CONFLICT");
  }
}

export class ValidationError extends AppError {
  public readonly errors: Record<string, string[]>;

  constructor(errors: Record<string, string[]>) {
    super("Validation failed", 422, "VALIDATION_ERROR");
    this.errors = errors;
  }
}
