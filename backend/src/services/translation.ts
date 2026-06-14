import OpenAI from "openai";
import { config } from "../config.js";
import { AppError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

const openai = new OpenAI({ apiKey: config.openaiApiKey });

export async function translateToEnglish(text: string, sourceLanguage: string): Promise<string> {
  if (sourceLanguage === "en" || sourceLanguage === "english") {
    return text;
  }

  try {
    logger.info({ sourceLanguage }, "Translating text to English");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a medical translator. Translate the following text from the detected language into English. Preserve all medical terms accurately. Output only the translated text, nothing else.",
        },
        { role: "user", content: text },
      ],
      temperature: 0,
    });

    const translated = response.choices[0]?.message?.content?.trim() ?? text;
    logger.info("Translation complete");
    return translated;
  } catch (err) {
    logger.error({ err }, "Translation failed, returning original text");
    return text;
  }
}
