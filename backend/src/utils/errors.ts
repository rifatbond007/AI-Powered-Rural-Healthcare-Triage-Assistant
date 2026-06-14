export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }

  static badRequest(message: string, details?: unknown) {
    return new AppError(400, "BAD_REQUEST", message, details);
  }

  static unauthorized(message = "Unauthorized") {
    return new AppError(401, "UNAUTHORIZED", message);
  }

  static notFound(message = "Resource not found") {
    return new AppError(404, "NOT_FOUND", message);
  }

  static tooMany(message = "Rate limit exceeded") {
    return new AppError(429, "RATE_LIMITED", message);
  }

  static internal(message = "Internal server error") {
    return new AppError(500, "INTERNAL_ERROR", message);
  }
}
