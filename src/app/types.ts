export type Lang = "en" | "bn";
export type Screen = "dashboard" | "step1" | "step2" | "step3" | "step4_loading" | "step4" | "step5";
export type TriageLevel = "critical" | "urgent" | "moderate" | "minor";
export type VitalStatus = "normal" | "warning" | "critical" | "empty";

export interface PatientData {
  name: string;
  age: string;
  gender: string;
  transcription: string;
}

export interface Vitals {
  bp: string;
  hr: string;
  temp: string;
  spo2: string;
  glucose: string;
}

export interface ExtractedRow {
  medication: string;
  dosage: string;
  diagnosis: string;
}

export interface TriageConfig {
  level: TriageLevel;
  score: number;
  reasoning: string;
  reasoningbn: string;
  conditions: Array<{ en: string; bn: string; probability: string }>;
  firstAid: Array<{ en: string; bn: string }>;
  referral: { en: string; bn: string };
}
