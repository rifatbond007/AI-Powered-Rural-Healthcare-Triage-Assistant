import { z } from "zod";

export const speakInputSchema = z.object({
  text: z.string().min(1).max(5000),
  language: z.enum(["en", "bn"]),
});

export const generateReportSchema = z.object({
  patientId: z.string().uuid(),
  triageCaseId: z.string().uuid(),
});

export type SpeakInput = z.infer<typeof speakInputSchema>;
export type GenerateReportInput = z.infer<typeof generateReportSchema>;
