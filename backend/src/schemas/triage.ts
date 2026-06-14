import { z } from "zod";

export const triageInputSchema = z.object({
  englishSymptoms: z.string().min(1),
  medicalHistory: z.string().optional(),
  vitalsAnomalies: z.array(z.any()).optional(),
  patientAge: z.number().min(0).max(150),
  patientGender: z.enum(["male", "female", "other"]),
});

export const conditionSchema = z.object({
  name: z.string(),
  probability: z.enum(["High", "Moderate", "Low"]),
});

export const firstAidSchema = z.object({
  step: z.string(),
});

export const triageResponseSchema = z.object({
  triageLevel: z.enum(["GREEN", "YELLOW", "RED", "BLACK"]),
  triageScore: z.number().min(0).max(100),
  reasoning: z.string(),
  differentialDiagnoses: z.array(conditionSchema),
  firstAidSteps: z.array(firstAidSchema),
  referralNeeded: z.boolean(),
  referralUrgency: z.string().optional(),
  disclaimer: z.string(),
});

export type TriageInput = z.infer<typeof triageInputSchema>;
export type Condition = z.infer<typeof conditionSchema>;
export type TriageResponse = z.infer<typeof triageResponseSchema>;
