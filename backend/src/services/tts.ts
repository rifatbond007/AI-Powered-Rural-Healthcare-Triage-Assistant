import OpenAI from "openai";
import { config } from "../config.js";
import { AppError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";
import { writeFile } from "node:fs/promises";
import path from "node:path";

const openai = new OpenAI({ apiKey: config.openaiApiKey });

export async function generateSpeech(text: string, language: string): Promise<string> {
  try {
    logger.info({ language }, "Generating TTS audio");

    const voice = language === "bn" ? "alloy" : "alloy";

    const response = await openai.audio.speech.create({
      model: "tts-1",
      voice,
      input: text,
      response_format: "mp3",
    });

    const buffer = Buffer.from(await response.arrayBuffer());
    const filename = `tts-${Date.now()}.mp3`;
    const filePath = path.resolve("uploads", filename);
    await writeFile(filePath, buffer);

    logger.info({ filename }, "TTS audio saved");
    return filePath;
  } catch (err) {
    logger.error({ err }, "TTS generation failed");
    throw AppError.internal("Speech synthesis failed. Please try again.");
  }
}
