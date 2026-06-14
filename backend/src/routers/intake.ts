import { Router } from "express";
import { transcribeAudio } from "../services/speech.js";
import { translateToEnglish } from "../services/translation.js";
import { uploadAudio } from "../middleware/upload.js";
import { authGuard } from "../middleware/auth.js";
import { aiRateLimit } from "../middleware/rate-limit.js";
import { AppError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

const router = Router();

router.post(
  "/transcribe",
  authGuard,
  aiRateLimit,
  uploadAudio.single("audio"),
  async (req, res) => {
    if (!req.file) {
      throw AppError.badRequest("Audio file is required");
    }

    logger.info({ file: req.file.originalname }, "Processing audio intake");

    const { originalText, detectedLanguage } = await transcribeAudio(req.file.path);
    const englishText = await translateToEnglish(originalText, detectedLanguage);

    res.json({ originalText, detectedLanguage, englishText });
  },
);

export default router;
