import "dotenv/config";

function req(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env variable: ${key}`);
  return val;
}

function opt(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

function num(key: string, fallback: number): number {
  const val = process.env[key];
  return val ? Number(val) : fallback;
}

export const config = {
  port: num("PORT", 4000),
  nodeEnv: opt("NODE_ENV", "development"),
  databaseUrl: req("DATABASE_URL"),
  jwtSecret: req("JWT_SECRET"),
  jwtExpiresIn: opt("JWT_EXPIRES_IN", "24h"),
  openaiApiKey: req("OPENAI_API_KEY"),
  googleVisionApiKey: opt("GOOGLE_CLOUD_VISION_API_KEY", ""),
  ocrEngine: opt("OCR_ENGINE", "google_vision"),
  maxFileSizeMb: num("MAX_FILE_SIZE_MB", 5),
  corsOrigin: opt("CORS_ORIGIN", "http://localhost:5173"),
} as const;
