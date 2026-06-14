import express from "express";
import cors from "cors";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { config } from "./config.js";
import { errorHandler } from "./middleware/error.js";
import { generalRateLimit } from "./middleware/rate-limit.js";
import { logger } from "./utils/logger.js";

import authRouter from "./routers/auth.js";
import intakeRouter from "./routers/intake.js";
import ocrRouter from "./routers/ocr.js";
import vitalsRouter from "./routers/vitals.js";
import triageRouter from "./routers/triage.js";
import reportRouter from "./routers/report.js";
import patientsRouter from "./routers/patients.js";

const app = express();

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());
app.use(generalRateLimit);

app.use("/uploads", express.static("uploads"));

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "RuralCare Triage API",
      version: "1.0.0",
      description: "AI-Powered Rural Healthcare Triage & Decision Support System",
    },
    servers: [{ url: `http://localhost:${config.port}` }],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
    },
  },
  apis: [],
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/auth", authRouter);
app.use("/intake", intakeRouter);
app.use("/ocr", ocrRouter);
app.use("/vitals", vitalsRouter);
app.use("/triage", triageRouter);
app.use("/report", reportRouter);
app.use("/patients", patientsRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use(errorHandler);

process.on("unhandledRejection", (reason) => {
  logger.error({ reason }, "Unhandled rejection");
});

export default app;
