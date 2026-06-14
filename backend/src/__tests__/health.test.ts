import { describe, it, expect, beforeAll, vi } from "vitest";
import type { Express } from "express";
import request from "supertest";

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

vi.mock("../utils/logger.js", () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

let app: Express;

beforeAll(async () => {
  const mod = await import("../app.js");
  app = mod.default;
});

describe("GET /health", () => {
  it("returns 200 with status ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  it("response contains timestamp", async () => {
    const res = await request(app).get("/health");
    expect(res.body).toHaveProperty("timestamp");
    expect(typeof res.body.timestamp).toBe("string");
    expect(res.body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});
