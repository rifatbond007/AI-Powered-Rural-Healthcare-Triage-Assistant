import axios from "axios";

const BASE_URL = "http://localhost:4000";

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.reload();
    }
    return Promise.reject(err);
  },
);

export interface LoginInput {
  email: string;
  password: string;
}
export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  clinicLocation: string;
}
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  clinicLocation: string;
}
export interface LoginResponse {
  token: string;
  user: AuthUser;
}
export interface PatientCase {
  id: string;
  name: string;
  age: number;
  gender: string;
  createdAt: string;
  latestTriage: { triageScore: string; createdAt: string } | null;
}
export interface PaginatedPatients {
  patients: PatientCase[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}
export interface CreatePatientInput {
  name: string;
  age: number;
  gender: string;
}
export interface TranscribeResponse {
  originalText: string;
  detectedLanguage: string;
  englishText: string;
}
export interface OcrResponse {
  rawText: string;
  entities: {
    medications: string[];
    dosages: string[];
    diagnoses: string[];
    tests: string[];
    results: string[];
  };
}
export interface VitalsInput {
  bloodPressure: string;
  heartRate: number;
  temperature: number;
  spo2: number;
  glucose: number;
}
export interface AnomalyItem {
  vital: string;
  value: string | number;
  range: { min: number; max: number };
  severity: "NORMAL" | "WARNING" | "CRITICAL";
  message: string;
}
export interface VitalsResponse {
  anomalies: AnomalyItem[];
  overallSeverity: "NORMAL" | "WARNING" | "CRITICAL";
}
export interface TriageInput {
  englishSymptoms: string;
  medicalHistory?: string;
  vitalsAnomalies?: AnomalyItem[];
  patientAge: number;
  patientGender: "male" | "female" | "other";
}
export interface Condition {
  name: string;
  probability: "High" | "Moderate" | "Low";
}
export interface FirstAidStep {
  step: string;
}
export interface TriageResponse {
  triageLevel: "GREEN" | "YELLOW" | "RED" | "BLACK";
  triageScore: number;
  reasoning: string;
  differentialDiagnoses: Condition[];
  firstAidSteps: FirstAidStep[];
  referralNeeded: boolean;
  referralUrgency?: string;
  disclaimer: string;
}
export interface SpeakInput {
  text: string;
  language: "en" | "bn";
}
export interface SpeakResponse {
  audioUrl: string;
}
export interface GenerateReportInput {
  patientId: string;
  triageCaseId: string;
}
export interface GenerateReportResponse {
  reportUrl: string;
}

export function login(data: LoginInput) {
  return api.post<LoginResponse>("/auth/login", data).then((r) => r.data);
}
export function register(data: RegisterInput) {
  return api.post("/auth/register", data).then((r) => r.data);
}
export function getPatients(page = 1, limit = 20) {
  return api.get<PaginatedPatients>("/patients", { params: { page, limit } }).then((r) => r.data);
}
export function createPatient(data: CreatePatientInput) {
  return api.post("/patients", data).then((r) => r.data);
}
export function getPatient(id: string) {
  return api.get(`/patients/${id}`).then((r) => r.data);
}
export function transcribeAudio(file: Blob, filename: string) {
  const fd = new FormData();
  fd.append("audio", file, filename);
  return api.post<TranscribeResponse>("/intake/transcribe", fd).then((r) => r.data);
}
export function extractOcr(file: Blob, filename: string) {
  const fd = new FormData();
  fd.append("image", file, filename);
  return api.post<OcrResponse>("/ocr/extract", fd).then((r) => r.data);
}
export function analyzeVitals(data: VitalsInput) {
  return api.post<VitalsResponse>("/vitals/analyze", data).then((r) => r.data);
}
export function analyzeTriage(data: TriageInput) {
  return api.post<TriageResponse>("/triage/analyze", data).then((r) => r.data);
}
export function speakReport(data: SpeakInput) {
  return api.post<SpeakResponse>("/report/speak", data).then((r) => r.data);
}
export function generateReport(data: GenerateReportInput) {
  return api.post<GenerateReportResponse>("/report/generate", data).then((r) => r.data);
}
