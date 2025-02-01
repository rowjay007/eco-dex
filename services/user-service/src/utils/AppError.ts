export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public errors: Record<string, string> = {}
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  static BadRequest(message: string, errors: Record<string, string> = {}) {
    return new AppError(message, 400, errors);
  }

  static Unauthorized(
    message: string = "Unauthorized access",
    errors: Record<string, string> = {}
  ) {
    return new AppError(message, 401, errors);
  }

  static Forbidden(
    message: string = "Forbidden access",
    errors: Record<string, string> = {}
  ) {
    return new AppError(message, 403, errors);
  }

  static NotFound(
    message: string = "Resource not found",
    errors: Record<string, string> = {}
  ) {
    return new AppError(message, 404, errors);
  }

  static Conflict(
    message: string = "Resource conflict",
    errors: Record<string, string> = {}
  ) {
    return new AppError(message, 409, errors);
  }

  static InternalServer(
    message: string = "Internal server error",
    errors: Record<string, string> = {}
  ) {
    return new AppError(message, 500, errors);
  }
}
