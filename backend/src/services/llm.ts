import OpenAI from "openai";
import { config } from "../config.js";
import { AppError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";
import type { TriageInput, TriageResponse } from "../schemas/triage.js";
import { triageResponseSchema } from "../schemas/triage.js";

const openai = new OpenAI({ apiKey: config.openaiApiKey });

const SYSTEM_PROMPT = `You are an AI triage ASSISTANT for Community Health Workers in rural Bangladesh. Your role is decision SUPPORT — you are NOT a doctor and your output is NOT a medical diagnosis.

CLINICAL GUIDELINES:
1. Triage levels: GREEN (minor/non-urgent), YELLOW (moderate/monitor), RED (urgent/immediate referral), BLACK (critical/life-threatening).
2. Always consider patient age and gender in risk assessment.
3. Vitals anomalies significantly increase triage severity.
4. Err on the side of SAFETY — escalate when uncertain.
5. Consider resource-limited rural setting in recommendations.

OUTPUT FORMAT — Return valid JSON only:
{
  "triageLevel": "GREEN" | "YELLOW" | "RED" | "BLACK",
  "triageScore": number (0-100),
  "reasoning": "Brief clinical reasoning in plain English",
  "differentialDiagnoses": [{"name": "string", "probability": "High" | "Moderate" | "Low"}],
  "firstAidSteps": [{"step": "string"}],
  "referralNeeded": boolean,
  "referralUrgency": "string or null"
}`;

export async function analyzeTriage(input: TriageInput): Promise<TriageResponse> {
  try {
    logger.info({ age: input.patientAge, gender: input.patientGender }, "Running triage analysis");

    const symptomsText = `Symptoms: ${input.englishSymptoms}`;
    const historyText = input.medicalHistory ? `\nHistory: ${input.medicalHistory}` : "";
    const vitalsText =
      input.vitalsAnomalies && input.vitalsAnomalies.length > 0
        ? `\nVitals anomalies: ${JSON.stringify(input.vitalsAnomalies)}`
        : "";

    const userPrompt = `${symptomsText}${historyText}${vitalsText}\n\nAge: ${input.patientAge}\nGender: ${input.patientGender}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.2,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(content) as Record<string, unknown>;

    const result = triageResponseSchema.parse({
      ...parsed,
      disclaimer: "AI decision support only — not a medical diagnosis. Always use professional judgment.",
    });

    logger.info({ triageLevel: result.triageLevel, score: result.triageScore }, "Triage analysis complete");
    return result;
  } catch (err) {
    logger.error({ err }, "Triage analysis failed");
    throw AppError.internal("AI triage analysis failed. Please try again.");
  }
}
