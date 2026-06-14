import OpenAI from "openai";
import { config } from "../config.js";
import { AppError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

const openai = new OpenAI({ apiKey: config.openaiApiKey });

export async function transcribeAudio(filePath: string): Promise<{
  originalText: string;
  detectedLanguage: string;
}> {
  try {
    logger.info({ filePath }, "Transcribing audio via Whisper");

    const response = await openai.audio.transcriptions.create({
      file: await import("node:fs").then((fs) => fs.createReadStream(filePath)),
      model: "whisper-1",
      response_format: "verbose_json",
    });

    const detectedLanguage = response.language ?? "unknown";
    logger.info({ detectedLanguage }, "Whisper transcription complete");

    return {
      originalText: response.text,
      detectedLanguage,
    };
  } catch (err) {
    logger.error({ err }, "Whisper transcription failed");
    throw AppError.internal("Speech transcription failed. Please try again.");
  }
}
