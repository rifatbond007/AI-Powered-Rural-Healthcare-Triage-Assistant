import { describe, it, expect, vi, beforeEach } from "vitest";

const shared = vi.hoisted(() => ({
  mockPost: vi.fn(),
  mockGet: vi.fn(),
  handlers: {} as Record<string, any>,
}));

vi.mock("axios", () => ({
  default: {
    create: vi.fn(() => ({
      interceptors: {
        request: { use: (fn: any) => { shared.handlers.request = fn; } },
        response: { use: (s: any, e: any) => { shared.handlers.responseSuccess = s; shared.handlers.responseError = e; } },
      },
      post: shared.mockPost,
      get: shared.mockGet,
    })),
  },
}));

import {
  login,
  register,
  getPatients,
  createPatient,
  transcribeAudio,
  extractOcr,
  analyzeVitals,
  analyzeTriage,
} from "@/app/api";

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

describe("login", () => {
  it("calls POST /auth/login with credentials and returns token and user", async () => {
    const user = { id: "1", name: "Test", email: "a@b.com", clinicLocation: "C" };
    shared.mockPost.mockResolvedValue({ data: { token: "abc123", user } });
    const result = await login({ email: "a@b.com", password: "secret" });
    expect(shared.mockPost).toHaveBeenCalledWith("/auth/login", { email: "a@b.com", password: "secret" });
    expect(result).toEqual({ token: "abc123", user });
  });
});

describe("register", () => {
  it("calls POST /auth/register with input data", async () => {
    const input = { name: "Test", email: "a@b.com", password: "pw", clinicLocation: "Clinic" };
    shared.mockPost.mockResolvedValue({ data: { token: "t" } });
    await register(input);
    expect(shared.mockPost).toHaveBeenCalledWith("/auth/register", input);
  });
});

describe("getPatients", () => {
  it("calls GET /patients with default pagination params", async () => {
    shared.mockGet.mockResolvedValue({ data: { patients: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } } });
    await getPatients();
    expect(shared.mockGet).toHaveBeenCalledWith("/patients", { params: { page: 1, limit: 20 } });
  });

  it("calls GET /patients with custom pagination", async () => {
    shared.mockGet.mockResolvedValue({ data: { patients: [], pagination: { page: 2, limit: 10, total: 0, totalPages: 0 } } });
    await getPatients(2, 10);
    expect(shared.mockGet).toHaveBeenCalledWith("/patients", { params: { page: 2, limit: 10 } });
  });
});

describe("createPatient", () => {
  it("calls POST /patients with patient data", async () => {
    const input = { name: "Patient", age: 30, gender: "male" };
    shared.mockPost.mockResolvedValue({ data: { id: "1" } });
    await createPatient(input);
    expect(shared.mockPost).toHaveBeenCalledWith("/patients", input);
  });
});

describe("transcribeAudio", () => {
  it("sends FormData with audio blob to /intake/transcribe", async () => {
    shared.mockPost.mockResolvedValue({ data: { originalText: "test" } });
    const blob = new Blob(["audio"], { type: "audio/webm" });
    await transcribeAudio(blob, "recording.webm");
    expect(shared.mockPost).toHaveBeenCalledWith("/intake/transcribe", expect.any(FormData));
  });
});

describe("extractOcr", () => {
  it("sends FormData with image to /ocr/extract", async () => {
    shared.mockPost.mockResolvedValue({ data: { rawText: "test" } });
    const blob = new Blob(["img"], { type: "image/jpeg" });
    await extractOcr(blob, "photo.jpg");
    expect(shared.mockPost).toHaveBeenCalledWith("/ocr/extract", expect.any(FormData));
  });
});

describe("analyzeVitals", () => {
  it("calls POST /vitals/analyze with vitals data", async () => {
    const vitals = { bloodPressure: "120/80", heartRate: 75, temperature: 36.5, spo2: 98, glucose: 100 };
    shared.mockPost.mockResolvedValue({ data: { anomalies: [], overallSeverity: "NORMAL" } });
    await analyzeVitals(vitals);
    expect(shared.mockPost).toHaveBeenCalledWith("/vitals/analyze", vitals);
  });
});

describe("analyzeTriage", () => {
  it("calls POST /triage/analyze with triage input", async () => {
    const input = { englishSymptoms: "headache", patientAge: 30, patientGender: "male" as const };
    shared.mockPost.mockResolvedValue({ data: { triageLevel: "GREEN", triageScore: 0, reasoning: "", differentialDiagnoses: [], firstAidSteps: [], referralNeeded: false, disclaimer: "" } });
    await analyzeTriage(input);
    expect(shared.mockPost).toHaveBeenCalledWith("/triage/analyze", input);
  });
});

describe("request interceptor", () => {
  it("adds Bearer token from localStorage", () => {
    localStorage.setItem("token", "test-token");
    const config = { headers: {} };
    const result = shared.handlers.request(config);
    expect(result.headers.Authorization).toBe("Bearer test-token");
  });

  it("does not add Authorization header when no token exists", () => {
    const config = { headers: {} };
    const result = shared.handlers.request(config);
    expect(result.headers.Authorization).toBeUndefined();
  });
});

describe("response interceptor", () => {
  it("passes through successful response", () => {
    const res = { data: "ok" };
    expect(shared.handlers.responseSuccess(res)).toBe(res);
  });

  it("clears localStorage on 401 and rejects", async () => {
    localStorage.setItem("token", "t");
    localStorage.setItem("user", "u");
    const err = { response: { status: 401 } };
    await expect(shared.handlers.responseError(err)).rejects.toEqual(err);
    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
  });

  it("passes through non-401 errors without side effects", async () => {
    localStorage.setItem("token", "t");
    const err = { response: { status: 500 } };
    await expect(shared.handlers.responseError(err)).rejects.toEqual(err);
    expect(localStorage.getItem("token")).toBe("t");
  });
});
