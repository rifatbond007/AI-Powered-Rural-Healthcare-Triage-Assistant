import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import type { Express } from "express";
import request from "supertest";
import jwt from "jsonwebtoken";

const mockPatientCreate = vi.hoisted(() => vi.fn());
const mockPatientFindMany = vi.hoisted(() => vi.fn());
const mockPatientCount = vi.hoisted(() => vi.fn());
const mockPatientFindFirst = vi.hoisted(() => vi.fn());

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

vi.mock("../database.js", () => ({
  prisma: {
    patient: {
      create: mockPatientCreate,
      findMany: mockPatientFindMany,
      count: mockPatientCount,
      findFirst: mockPatientFindFirst,
    },
  },
}));

const testJwtSecret = "test-secret-test-secret-test-secret!";
const validToken = jwt.sign({ userId: "chw-1", email: "chw@example.com" }, testJwtSecret);
const authHeader = { authorization: `Bearer ${validToken}` };

let app: Express;

beforeAll(async () => {
  const mod = await import("../app.js");
  app = mod.default;
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /patients", () => {
  const payload = { name: "John Doe", age: 45, gender: "male" };

  it("creates patient and returns patient data", async () => {
    mockPatientCreate.mockResolvedValue({
      id: "patient-1",
      name: "John Doe",
      age: 45,
      gender: "male",
      chwId: "chw-1",
      createdAt: "2025-01-01T00:00:00.000Z",
    });

    const res = await request(app).post("/patients").set(authHeader).send(payload);

    expect(res.status).toBe(201);
    expect(res.body.patient).toMatchObject({
      id: "patient-1",
      name: "John Doe",
      age: 45,
      gender: "male",
    });
    expect(mockPatientCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ name: "John Doe", age: 45, gender: "male", chwId: "chw-1" }),
      }),
    );
  });

  it("returns 401 without auth token", async () => {
    const res = await request(app).post("/patients").send(payload);
    expect(res.status).toBe(401);
    expect(mockPatientCreate).not.toHaveBeenCalled();
  });

  it("rejects invalid patient data", async () => {
    const res = await request(app).post("/patients").set(authHeader).send({ name: "", age: -1, gender: "unknown" });
    expect(res.status).toBe(500);
  });
});

describe("GET /patients", () => {
  it("returns paginated patient list", async () => {
    const patients = [
      {
        id: "patient-1",
        name: "John Doe",
        age: 45,
        gender: "male",
        createdAt: "2025-01-01T00:00:00.000Z",
        triageCases: [{ triageScore: "YELLOW", createdAt: "2025-01-01T01:00:00.000Z" }],
      },
      {
        id: "patient-2",
        name: "Jane Doe",
        age: 30,
        gender: "female",
        createdAt: "2025-01-02T00:00:00.000Z",
        triageCases: [],
      },
    ];
    mockPatientFindMany.mockResolvedValue(patients);
    mockPatientCount.mockResolvedValue(2);

    const res = await request(app).get("/patients").set(authHeader);

    expect(res.status).toBe(200);
    expect(res.body.patients).toHaveLength(2);
    expect(res.body.patients[0].name).toBe("John Doe");
    expect(res.body.patients[1].name).toBe("Jane Doe");
    expect(res.body.pagination).toEqual({ page: 1, limit: 20, total: 2, totalPages: 1 });
  });

  it("respects page and limit query params", async () => {
    mockPatientFindMany.mockResolvedValue([]);
    mockPatientCount.mockResolvedValue(1);

    const res = await request(app).get("/patients?page=2&limit=10").set(authHeader);

    expect(res.status).toBe(200);
    expect(mockPatientFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 10 }),
    );
    expect(res.body.pagination).toEqual({ page: 2, limit: 10, total: 1, totalPages: 1 });
  });

  it("returns 401 without auth token", async () => {
    const res = await request(app).get("/patients");
    expect(res.status).toBe(401);
  });
});

describe("GET /patients/:id", () => {
  it("returns single patient with triage cases", async () => {
    const patient = {
      id: "patient-1",
      name: "John Doe",
      age: 45,
      gender: "male",
      chwId: "chw-1",
      createdAt: "2025-01-01T00:00:00.000Z",
      triageCases: [
        { id: "tc-1", triageScore: "YELLOW", createdAt: "2025-01-01T01:00:00.000Z" },
      ],
    };
    mockPatientFindFirst.mockResolvedValue(patient);

    const res = await request(app).get("/patients/patient-1").set(authHeader);

    expect(res.status).toBe(200);
    expect(res.body.patient).toMatchObject({ id: "patient-1", name: "John Doe" });
    expect(res.body.patient.triageCases).toHaveLength(1);
  });

  it("returns 404 for non-existent patient", async () => {
    mockPatientFindFirst.mockResolvedValue(null);

    const res = await request(app).get("/patients/non-existent").set(authHeader);

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("returns 401 without auth token", async () => {
    const res = await request(app).get("/patients/patient-1");
    expect(res.status).toBe(401);
  });
});
