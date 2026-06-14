import { describe, it, expect } from "vitest";
import { AppError } from "../utils/errors.js";

describe("AppError", () => {
  it("constructor sets statusCode, code, message, and details", () => {
    const err = new AppError(418, "TEAPOT", "I'm a teapot", { short: true });
    expect(err.statusCode).toBe(418);
    expect(err.code).toBe("TEAPOT");
    expect(err.message).toBe("I'm a teapot");
    expect(err.details).toEqual({ short: true });
    expect(err.name).toBe("AppError");
  });

  it("badRequest creates 400 error", () => {
    const err = AppError.badRequest("Invalid input");
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe("BAD_REQUEST");
    expect(err.message).toBe("Invalid input");
  });

  it("unauthorized creates 401 error with default message", () => {
    const err = AppError.unauthorized();
    expect(err.statusCode).toBe(401);
    expect(err.code).toBe("UNAUTHORIZED");
    expect(err.message).toBe("Unauthorized");
  });

  it("notFound creates 404 error with default message", () => {
    const err = AppError.notFound();
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe("NOT_FOUND");
    expect(err.message).toBe("Resource not found");
  });

  it("tooMany creates 429 error with default message", () => {
    const err = AppError.tooMany();
    expect(err.statusCode).toBe(429);
    expect(err.code).toBe("RATE_LIMITED");
    expect(err.message).toBe("Rate limit exceeded");
  });

  it("internal creates 500 error with default message", () => {
    const err = AppError.internal();
    expect(err.statusCode).toBe(500);
    expect(err.code).toBe("INTERNAL_ERROR");
    expect(err.message).toBe("Internal server error");
  });

  it("custom messages override defaults", () => {
    const err = AppError.notFound("Patient not found");
    expect(err.message).toBe("Patient not found");
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe("NOT_FOUND");
  });
});
