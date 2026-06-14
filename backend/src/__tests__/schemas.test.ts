import { describe, it, expect } from "vitest";
import { registerSchema, loginSchema } from "../schemas/auth.js";
import { vitalsInputSchema } from "../schemas/vitals.js";

describe("registerSchema", () => {
  const validData = {
    name: "Test User",
    email: "test@example.com",
    password: "password123",
    clinicLocation: "Clinic A",
  };

  it("passes for valid data", () => {
    const result = registerSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("fails when name is missing", () => {
    const { name: _, ...rest } = validData;
    const result = registerSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("fails for invalid email", () => {
    const result = registerSchema.safeParse({ ...validData, email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("fails for short password", () => {
    const result = registerSchema.safeParse({ ...validData, password: "short" });
    expect(result.success).toBe(false);
  });

  it("fails when clinicLocation is missing", () => {
    const { clinicLocation: _, ...rest } = validData;
    const result = registerSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  const validData = {
    email: "test@example.com",
    password: "password",
  };

  it("passes for valid data", () => {
    const result = loginSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("fails when email is missing", () => {
    const result = loginSchema.safeParse({ password: "password" });
    expect(result.success).toBe(false);
  });

  it("fails for empty password", () => {
    const result = loginSchema.safeParse({ email: "test@example.com", password: "" });
    expect(result.success).toBe(false);
  });
});

describe("vitalsInputSchema", () => {
  const validVitals = {
    bloodPressure: "120/80",
    heartRate: 75,
    temperature: 36.8,
    spo2: 98,
    glucose: 100,
  };

  it("passes for valid vitals", () => {
    const result = vitalsInputSchema.safeParse(validVitals);
    expect(result.success).toBe(true);
  });

  it("fails for invalid BP format", () => {
    const result = vitalsInputSchema.safeParse({ ...validVitals, bloodPressure: "12080" });
    expect(result.success).toBe(false);
  });

  it("fails for BP with wrong separator", () => {
    const result = vitalsInputSchema.safeParse({ ...validVitals, bloodPressure: "120-80" });
    expect(result.success).toBe(false);
  });

  it("fails for out-of-range heartRate", () => {
    const result = vitalsInputSchema.safeParse({ ...validVitals, heartRate: 300 });
    expect(result.success).toBe(false);
  });

  it("fails for out-of-range temperature", () => {
    const result = vitalsInputSchema.safeParse({ ...validVitals, temperature: 50 });
    expect(result.success).toBe(false);
  });

  it("fails for out-of-range spo2", () => {
    const result = vitalsInputSchema.safeParse({ ...validVitals, spo2: 30 });
    expect(result.success).toBe(false);
  });

  it("fails for out-of-range glucose", () => {
    const result = vitalsInputSchema.safeParse({ ...validVitals, glucose: 700 });
    expect(result.success).toBe(false);
  });

  it("passes for boundary values", () => {
    const result = vitalsInputSchema.safeParse({
      ...validVitals,
      heartRate: 20,
      temperature: 34,
      spo2: 50,
      glucose: 20,
    });
    expect(result.success).toBe(true);
  });
});
