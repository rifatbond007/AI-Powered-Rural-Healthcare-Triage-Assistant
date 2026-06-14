import { Router } from "express";
import { speakInputSchema } from "../schemas/report.js";
import { generateSpeech } from "../services/tts.js";
import { generatePdf } from "../services/report.js";
import { authGuard } from "../middleware/auth.js";
import { aiRateLimit } from "../middleware/rate-limit.js";
import { prisma } from "../database.js";
import { AppError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";
import { config } from "../config.js";

const router = Router();

router.post("/speak", authGuard, aiRateLimit, async (req, res) => {
  const input = speakInputSchema.parse(req.body);

  const audioPath = await generateSpeech(input.text, input.language);

  const filename = audioPath.split("/").pop() ?? "audio.mp3";
  const baseUrl = `${req.protocol}://${req.get("host")}`;

  res.json({ audioUrl: `${baseUrl}/uploads/${filename}` });
});

router.post("/generate", authGuard, aiRateLimit, async (req, res) => {
  const { patientId, triageCaseId } = req.body as { patientId: string; triageCaseId: string };

  if (!patientId || !triageCaseId) {
    throw AppError.badRequest("patientId and triageCaseId are required");
  }

  const triageCase = await prisma.triageCase.findUnique({
    where: { id: triageCaseId },
    include: { patient: { include: { chw: true } } },
  });

  if (!triageCase) {
    throw AppError.notFound("Triage case not found");
  }

  const vitals = triageCase.vitals as Record<string, unknown> | undefined;
  const anomalies = triageCase.vitalsAnomalies as Array<{
    vital: string; value: unknown; severity: string; message: string;
  }> | undefined;

  const pdfPath = await generatePdf({
    patientName: triageCase.patient.name,
    patientAge: triageCase.patient.age,
    patientGender: triageCase.patient.gender,
    chwName: triageCase.patient.chw.name,
    clinicLocation: triageCase.patient.chw.clinicLocation,
    date: new Date().toISOString(),
    symptomsEnglish: triageCase.symptomsEnglish ?? undefined,
    vitals,
    vitalsAnomalies: anomalies,
    triageLevel: triageCase.triageScore,
    triageScore: computeScore(triageCase.triageScore),
    reasoning: triageCase.reasoning ?? "",
    differentialDiagnoses: (triageCase.differentialDiagnoses ?? []) as Array<{
      name: string; probability: string;
    }>,
    firstAidSteps: (triageCase.firstAidSteps ?? []) as Array<{ step: string }>,
    referralNeeded: triageCase.referralNeeded,
    referralUrgency: triageCase.referralUrgency ?? undefined,
  });

  const filename = pdfPath.split("/").pop() ?? "report.pdf";
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const reportUrl = `${baseUrl}/uploads/${filename}`;

  await prisma.triageCase.update({
    where: { id: triageCaseId },
    data: { reportUrl },
  });

  logger.info({ triageCaseId, reportUrl }, "Report generated");

  res.json({ reportUrl });
});

function computeScore(level: string): number {
  const map: Record<string, number> = { GREEN: 20, YELLOW: 50, RED: 80, BLACK: 95 };
  return map[level] ?? 50;
}

export default router;
