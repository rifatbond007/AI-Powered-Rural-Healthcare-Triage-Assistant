import { z } from "zod";

export const ocrEntitiesSchema = z.object({
  medications: z.array(z.string()),
  dosages: z.array(z.string()),
  diagnoses: z.array(z.string()),
  tests: z.array(z.string()),
  results: z.array(z.string()),
});

export const ocrResponseSchema = z.object({
  rawText: z.string(),
  entities: ocrEntitiesSchema,
});

export type OcrEntities = z.infer<typeof ocrEntitiesSchema>;
export type OcrResponse = z.infer<typeof ocrResponseSchema>;
