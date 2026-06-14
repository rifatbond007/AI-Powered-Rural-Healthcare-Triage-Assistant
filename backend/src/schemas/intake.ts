import { z } from "zod";

export const transcribeResponseSchema = z.object({
  originalText: z.string(),
  detectedLanguage: z.string(),
  englishText: z.string(),
});

export type TranscribeResponse = z.infer<typeof transcribeResponseSchema>;
