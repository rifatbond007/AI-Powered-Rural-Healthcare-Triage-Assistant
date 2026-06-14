import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import type { Express } from "express";
import request from "supertest";

const mockUserFindUnique = vi.hoisted(() => vi.fn());
const mockUserCreate = vi.hoisted(() => vi.fn());
const mockBcryptHash = vi.hoisted(() => vi.fn().mockResolvedValue("$2a$12$testhashedpassword"));
const mockBcryptCompare = vi.hoisted(() => vi.fn().mockResolvedValue(true));

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

vi.mock("bcryptjs", () => ({
  default: {
    hash: mockBcryptHash,
    compare: mockBcryptCompare,
  },
  hash: mockBcryptHash,
  compare: mockBcryptCompare,
}));

vi.mock("../database.js", () => ({
  prisma: {
    user: {
      findUnique: mockUserFindUnique,
      create: mockUserCreate,
    },
  },
}));

let app: Express;

beforeAll(async () => {
  const mod = await import("../app.js");
  app = mod.default;
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /auth/register", () => {
  const payload = {
    name: "New User",
    email: "new@example.com",
    password: "password123",
    clinicLocation: "Clinic A",
  };

  it("creates user and returns user data", async () => {
    mockUserFindUnique.mockResolvedValue(null);
    mockUserCreate.mockResolvedValue({
      id: "user-1",
      name: "New User",
      email: "new@example.com",
      clinicLocation: "Clinic A",
    });

    const res = await request(app).post("/auth/register").send(payload);

    expect(res.status).toBe(201);
    expect(res.body.user).toEqual({
      id: "user-1",
      name: "New User",
      email: "new@example.com",
      clinicLocation: "Clinic A",
    });
    expect(mockUserFindUnique).toHaveBeenCalledWith({ where: { email: payload.email } });
    expect(mockUserCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: payload.name,
          email: payload.email,
          clinicLocation: payload.clinicLocation,
        }),
      }),
    );
  });

  it("rejects duplicate email", async () => {
    mockUserFindUnique.mockResolvedValue({ id: "existing-id" });

    const res = await request(app).post("/auth/register").send(payload);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("BAD_REQUEST");
    expect(res.body.error.message).toBe("A user with this email already exists");
  });
});

describe("POST /auth/login", () => {
  const payload = {
    email: "existing@example.com",
    password: "password123",
  };

  it("returns JWT token for valid credentials", async () => {
    mockUserFindUnique.mockResolvedValue({
      id: "user-1",
      name: "Test User",
      email: "existing@example.com",
      hashedPassword: "somehash",
      clinicLocation: "Clinic A",
    });
    mockBcryptCompare.mockResolvedValue(true);

    const res = await request(app).post("/auth/login").send(payload);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(typeof res.body.token).toBe("string");
    expect(res.body.token.split(".")).toHaveLength(3);
    expect(res.body.user).toEqual({
      id: "user-1",
      name: "Test User",
      email: "existing@example.com",
      clinicLocation: "Clinic A",
    });
  });

  it("rejects invalid password", async () => {
    mockUserFindUnique.mockResolvedValue({
      id: "user-1",
      name: "Test User",
      email: "existing@example.com",
      hashedPassword: "somehash",
      clinicLocation: "Clinic A",
    });
    mockBcryptCompare.mockResolvedValue(false);

    const res = await request(app).post("/auth/login").send(payload);

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  it("rejects non-existent email", async () => {
    mockUserFindUnique.mockResolvedValue(null);

    const res = await request(app).post("/auth/login").send(payload);

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });
});
