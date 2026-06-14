import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config.js";
import { AppError } from "../utils/errors.js";

export interface JwtPayload {
  userId: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authGuard(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw AppError.unauthorized("Missing or malformed token");
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, config.jwtSecret) as JwtPayload;
    req.user = payload;
    next();
  } catch {
    throw AppError.unauthorized("Invalid or expired token");
  }
}
