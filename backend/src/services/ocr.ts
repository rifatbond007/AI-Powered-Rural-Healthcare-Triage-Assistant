import { config } from "../config.js";
import { AppError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

async function googleVisionOcr(imagePath: string): Promise<string> {
  const imageBase64 = readFileSync(imagePath).toString("base64");

  const response = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${config.googleVisionApiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requests: [
          {
            image: { content: imageBase64 },
            features: [{ type: "TEXT_DETECTION", maxResults: 1 }],
          },
        ],
      }),
    },
  );

  if (!response.ok) {
    const body = await response.text();
    logger.error({ status: response.status, body }, "Google Vision OCR failed");
    throw AppError.internal("OCR processing failed");
  }

  const data = (await response.json()) as {
    responses: Array<{ textAnnotations?: Array<{ description: string }> }>;
  };

  return data.responses[0]?.textAnnotations?.[0]?.description ?? "";
}

function tesseractOcr(imagePath: string): string {
  try {
    const stdout = execSync(`tesseract "${imagePath}" stdout -l ben+eng 2>/dev/null`, {
      encoding: "utf-8",
      timeout: 30_000,
    });
    return stdout.trim();
  } catch (err) {
    logger.error({ err }, "Tesseract OCR failed");
    throw AppError.internal("Local OCR processing failed. Is tesseract installed?");
  }
}

export async function extractText(imagePath: string): Promise<string> {
  logger.info({ engine: config.ocrEngine }, "Running OCR");

  if (config.ocrEngine === "google_vision" && config.googleVisionApiKey) {
    return googleVisionOcr(imagePath);
  }

  return tesseractOcr(imagePath);
}
