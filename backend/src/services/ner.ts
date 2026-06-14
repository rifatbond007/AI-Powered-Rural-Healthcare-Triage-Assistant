import OpenAI from "openai";
import { config } from "../config.js";
import { AppError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";
import type { OcrEntities } from "../schemas/ocr.js";

const openai = new OpenAI({ apiKey: config.openaiApiKey });

export async function extractEntities(rawText: string): Promise<OcrEntities> {
  try {
    logger.info("Extracting medical entities via GPT");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You extract structured medical information from prescription and lab report text.

Return a JSON object with these exact keys:
- medications: array of strings
- dosages: array of strings
- diagnoses: array of strings
- tests: array of strings (lab tests mentioned)
- results: array of strings (test results)

If a field has no data, return an empty array. Output ONLY valid JSON.`,
        },
        { role: "user", content: rawText },
      ],
      temperature: 0,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(content) as OcrEntities;

    return {
      medications: parsed.medications ?? [],
      dosages: parsed.dosages ?? [],
      diagnoses: parsed.diagnoses ?? [],
      tests: parsed.tests ?? [],
      results: parsed.results ?? [],
    };
  } catch (err) {
    logger.error({ err }, "Entity extraction failed");
    throw AppError.internal("Entity extraction failed. Please try again.");
  }
}
