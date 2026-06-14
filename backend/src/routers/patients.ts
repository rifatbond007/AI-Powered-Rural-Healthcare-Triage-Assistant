import { Router, type Request } from "express";
import { z } from "zod";
import { prisma } from "../database.js";
import { authGuard } from "../middleware/auth.js";
import { AppError } from "../utils/errors.js";
import { generalRateLimit } from "../middleware/rate-limit.js";

const router = Router();

const createPatientSchema = z.object({
  name: z.string().min(1).max(200),
  age: z.number().int().min(0).max(150),
  gender: z.enum(["male", "female", "other"]),
});

router.post("/", authGuard, generalRateLimit, async (req, res) => {
  const input = createPatientSchema.parse(req.body);

  const patient = await prisma.patient.create({
    data: {
      name: input.name,
      age: input.age,
      gender: input.gender,
      chwId: req.user!.userId,
    },
  });

  res.status(201).json({ patient });
});

router.get("/", authGuard, async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
  const skip = (page - 1) * limit;

  const [patients, total] = await Promise.all([
    prisma.patient.findMany({
      where: { chwId: req.user!.userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        triageCases: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { triageScore: true, createdAt: true },
        },
      },
    }),
    prisma.patient.count({ where: { chwId: req.user!.userId } }),
  ]);

  res.json({
    patients: patients.map((p) => ({
      id: p.id,
      name: p.name,
      age: p.age,
      gender: p.gender,
      createdAt: p.createdAt,
      latestTriage: p.triageCases[0] ?? null,
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

router.get("/:id", authGuard, async (req: Request<{ id: string }>, res) => {
  const patient = await prisma.patient.findFirst({
    where: { id: req.params.id, chwId: req.user!.userId },
    include: {
      triageCases: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!patient) {
    throw AppError.notFound("Patient not found");
  }

  res.json({ patient });
});

export default router;
