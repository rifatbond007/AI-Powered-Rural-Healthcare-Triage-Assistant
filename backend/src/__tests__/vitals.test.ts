import { describe, it, expect, beforeAll, vi } from "vitest";
import type { Express } from "express";
import request from "supertest";
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

vi.mock("../utils/logger.js", () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

const testJwtSecret = "test-secret-test-secret-test-secret!";
const validToken = jwt.sign({ userId: "chw-1", email: "chw@example.com" }, testJwtSecret);
const authHeader = { authorization: `Bearer ${validToken}` };

let app: Express;

beforeAll(async () => {
  const mod = await import("../app.js");
  app = mod.default;
});

describe("POST /vitals/analyze", () => {
  const normalVitals = {
    bloodPressure: "120/80",
    heartRate: 75,
    temperature: 36.8,
    spo2: 98,
    glucose: 100,
  };

  it("returns anomalies for given vitals", async () => {
    const res = await request(app).post("/vitals/analyze").set(authHeader).send(normalVitals);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("anomalies");
    expect(res.body.anomalies).toHaveLength(6);
  });

  it("returns overallSeverity", async () => {
    const res = await request(app).post("/vitals/analyze").set(authHeader).send(normalVitals);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("overallSeverity");
    expect(res.body.overallSeverity).toBe("NORMAL");
  });

  it("each anomaly has correct structure", async () => {
    const res = await request(app).post("/vitals/analyze").set(authHeader).send(normalVitals);

    expect(res.status).toBe(200);
    for (const anomaly of res.body.anomalies) {
      expect(anomaly).toHaveProperty("vital");
      expect(anomaly).toHaveProperty("value");
      expect(anomaly).toHaveProperty("range");
      expect(anomaly.range).toHaveProperty("min");
      expect(anomaly.range).toHaveProperty("max");
      expect(anomaly).toHaveProperty("severity");
      expect(anomaly).toHaveProperty("message");
    }
  });

  it("returns critical severity for dangerous vitals", async () => {
    const criticalVitals = {
      bloodPressure: "180/120",
      heartRate: 130,
      temperature: 35,
      spo2: 85,
      glucose: 250,
    };

    const res = await request(app).post("/vitals/analyze").set(authHeader).send(criticalVitals);

    expect(res.status).toBe(200);
    expect(res.body.overallSeverity).toBe("CRITICAL");
    const critical = res.body.anomalies.filter((a: { severity: string }) => a.severity === "CRITICAL");
    expect(critical.length).toBeGreaterThanOrEqual(1);
  });

  it("rejects invalid vitals input", async () => {
    const invalidVitals = {
      bloodPressure: "invalid",
      heartRate: 999,
      temperature: 100,
      spo2: 200,
      glucose: -1,
    };

    const res = await request(app).post("/vitals/analyze").set(authHeader).send(invalidVitals);

    expect(res.status).toBe(500);
  });

  it("returns 401 without auth token", async () => {
    const res = await request(app).post("/vitals/analyze").send(normalVitals);
    expect(res.status).toBe(401);
  });
});
