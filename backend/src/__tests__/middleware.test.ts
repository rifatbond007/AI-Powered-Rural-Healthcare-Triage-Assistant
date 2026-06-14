import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

vi.mock("../config.js", () => ({
  config: {
    port: 4001,
    nodeEnv: "test",
    databaseUrl: "postgresql://test:test@localhost:5432/test",
    jwtSecret: "test-secret-test-secret-test-secret!",
    jwtExpiresIn: "1h",
    openaiApiKey: "sk-test",
    googleVisionApiKey: "",
    ocrEngine: "google_vision",
    maxFileSizeMb: 5,
    corsOrigin: "http://localhost:5173",
  },
}));

import { authGuard } from "../middleware/auth.js";
import { AppError } from "../utils/errors.js";

const TEST_SECRET = "test-secret-test-secret-test-secret!";

describe("authGuard", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = { headers: {} };
    res = {};
    next = vi.fn();
  });

  it("returns 401 for missing Authorization header", () => {
    try {
      authGuard(req as Request, res as Response, next);
      expect.fail("Should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).statusCode).toBe(401);
      expect((err as AppError).message).toBe("Missing or malformed token");
    }
  });

  it("returns 401 for malformed token (no Bearer prefix)", () => {
    req.headers = { authorization: "Basic token123" };
    try {
      authGuard(req as Request, res as Response, next);
      expect.fail("Should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).statusCode).toBe(401);
    }
  });

  it("returns 401 for invalid token", () => {
    req.headers = { authorization: "Bearer invalid.jwt.token" };
    try {
      authGuard(req as Request, res as Response, next);
      expect.fail("Should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).statusCode).toBe(401);
      expect((err as AppError).message).toBe("Invalid or expired token");
    }
  });

  it("returns 401 for expired token", () => {
    const expiredToken = jwt.sign({ userId: "u1", email: "a@b.com" }, TEST_SECRET, { expiresIn: "0s" });
    req.headers = { authorization: `Bearer ${expiredToken}` };
    try {
      authGuard(req as Request, res as Response, next);
      expect.fail("Should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).statusCode).toBe(401);
    }
  });

  it("calls next() and sets req.user for valid token", () => {
    const token = jwt.sign({ userId: "user-1", email: "test@example.com" }, TEST_SECRET);
    req.headers = { authorization: `Bearer ${token}` };

    authGuard(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledOnce();
    expect(req.user).toMatchObject({ userId: "user-1", email: "test@example.com" });
  });
});
