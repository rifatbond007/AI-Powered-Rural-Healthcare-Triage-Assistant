import { Router } from "express";
import { vitalsInputSchema } from "../schemas/vitals.js";
import { analyzeVitals } from "../services/anomaly.js";
import { authGuard } from "../middleware/auth.js";
import { aiRateLimit } from "../middleware/rate-limit.js";
import { logger } from "../utils/logger.js";

const router = Router();

router.post("/analyze", authGuard, aiRateLimit, async (req, res) => {
  const input = vitalsInputSchema.parse(req.body);

  logger.info("Analyzing vitals");
  const result = analyzeVitals(input);

  res.json(result);
});

export default router;
