import { z } from "zod";

export const vitalsInputSchema = z.object({
  bloodPressure: z.string().regex(/^\d{2,3}\/\d{2,3}$/, "Must be like 120/80"),
  heartRate: z.number().min(20).max(250),
  temperature: z.number().min(34).max(43),
  spo2: z.number().min(50).max(100),
  glucose: z.number().min(20).max(600),
});

export const anomalyItemSchema = z.object({
  vital: z.string(),
  value: z.union([z.string(), z.number()]),
  range: z.object({ min: z.number(), max: z.number() }),
  severity: z.enum(["NORMAL", "WARNING", "CRITICAL"]),
  message: z.string(),
});

export const vitalsResponseSchema = z.object({
  anomalies: z.array(anomalyItemSchema),
  overallSeverity: z.enum(["NORMAL", "WARNING", "CRITICAL"]),
});

export type VitalsInput = z.infer<typeof vitalsInputSchema>;
export type AnomalyItem = z.infer<typeof anomalyItemSchema>;
export type VitalsResponse = z.infer<typeof vitalsResponseSchema>;
