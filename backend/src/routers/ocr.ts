import { Router } from "express";
import { extractText } from "../services/ocr.js";
import { extractEntities } from "../services/ner.js";
import { uploadImage } from "../middleware/upload.js";
import { authGuard } from "../middleware/auth.js";
import { aiRateLimit } from "../middleware/rate-limit.js";
import { AppError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

const router = Router();

router.post(
  "/extract",
  authGuard,
  aiRateLimit,
  uploadImage.single("image"),
  async (req, res) => {
    if (!req.file) {
      throw AppError.badRequest("Image file is required");
    }

    logger.info({ file: req.file.originalname }, "Processing OCR extraction");

    const rawText = await extractText(req.file.path);
    const entities = await extractEntities(rawText);

    res.json({ rawText, entities });
  },
);

export default router;
