import { Router } from "express";
import { triageInputSchema } from "../schemas/triage.js";
import { analyzeTriage } from "../services/llm.js";
import { authGuard } from "../middleware/auth.js";
import { aiRateLimit } from "../middleware/rate-limit.js";
import { logger } from "../utils/logger.js";

const router = Router();

router.post("/analyze", authGuard, aiRateLimit, async (req, res) => {
  const input = triageInputSchema.parse(req.body);

  logger.info({ age: input.patientAge }, "Running triage analysis");
  const result = await analyzeTriage(input);

  res.json(result);
});

export default router;
