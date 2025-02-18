export class AppError extends Error {
  statusCode: number;
  errors?: Record<string, string>;

  constructor(message: string, statusCode: number = 500, errors?: Record<string, string>) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}