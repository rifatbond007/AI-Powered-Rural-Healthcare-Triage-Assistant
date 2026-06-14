import app from "./app.js";
import { config } from "./config.js";
import { logger } from "./utils/logger.js";
import { prisma } from "./database.js";

async function main() {
  await prisma.$connect();
  logger.info("Database connected");

  app.listen(config.port, () => {
    logger.info(`Server running on http://localhost:${config.port}`);
    logger.info(`API docs at http://localhost:${config.port}/docs`);
  });
}

main().catch((err) => {
  logger.error({ err }, "Failed to start server");
  process.exit(1);
});
