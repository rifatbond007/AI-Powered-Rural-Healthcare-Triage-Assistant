import { Router } from "express";
import bcrypt from "bcrypt";
import jwt, { type SignOptions } from "jsonwebtoken";
import { prisma } from "../database.js";
import { config } from "../config.js";
import { registerSchema, loginSchema } from "../schemas/auth.js";
import { AppError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";
import { generalRateLimit } from "../middleware/rate-limit.js";

const router = Router();

router.post("/register", generalRateLimit, async (req, res) => {
  const input = registerSchema.parse(req.body);

  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw AppError.badRequest("A user with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(input.password, 12);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      hashedPassword,
      clinicLocation: input.clinicLocation,
    },
  });

  logger.info({ userId: user.id }, "CHW registered");

  res.status(201).json({
    user: { id: user.id, name: user.name, email: user.email, clinicLocation: user.clinicLocation },
  });
});

router.post("/login", generalRateLimit, async (req, res) => {
  const input = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw AppError.unauthorized("Invalid email or password");
  }

  const valid = await bcrypt.compare(input.password, user.hashedPassword);
  if (!valid) {
    throw AppError.unauthorized("Invalid email or password");
  }

  const token = jwt.sign({ userId: user.id, email: user.email }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn as SignOptions["expiresIn"],
  });

  logger.info({ userId: user.id }, "CHW logged in");

  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, clinicLocation: user.clinicLocation },
  });
});

export default router;
