import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError";

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  const errorResponse: any = {
    success: false,
    message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  };

  if (err.errors) {
    errorResponse.errors = err.errors;
  }

  res.status(statusCode).json(errorResponse);
};

export const notFoundHandler = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const error = new AppError(`Not Found - ${req.originalUrl}`, 404);
  error.statusCode = 404;
  next(error);
};

export class ValidationException extends Error implements AppError {
  statusCode: number;
  errors: Record<string, string>;

  constructor(error: ZodError) {
    super("Validation failed");
    this.statusCode = 400;
    this.errors = {};
    error.errors.forEach((err) => {
      const path = err.path.join(".");
      this.errors[path] = err.message;
    });
  }
}
