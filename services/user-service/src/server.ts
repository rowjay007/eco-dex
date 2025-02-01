import { config } from "dotenv";
import app from "./app";
import appConfig from "./config/app.config";
import logger from "./utils/logger";
import { db } from "./config/database.config";

config();

const startServer = async () => {
  try {
    await db.execute("SELECT 1");
    logger.info("✅ Database connection successful");

    const server = app.listen(appConfig.port, () => {
      logger.info(
        `🚀 ${appConfig.serviceName} is running on port ${appConfig.port}`
      );
      logger.info(
        `🔗 Health check endpoint: http://localhost:${appConfig.port}/health`
      );
      logger.info(
        `🔐 Auth endpoints available at http://localhost:${appConfig.port}/auth`
      );
    });

    const shutdown = (signal: string) => {
      return async () => {
        logger.info(`🛑 Received ${signal}. Shutting down server...`);

        try {
          await new Promise<void>((resolve, reject) => {
            server.close((err) => {
              if (err) {
                return reject(err);
              }
              resolve();
            });
          });

          logger.info("👋 Server closed successfully.");
        } catch (error) {
          logger.error("❌ Error during server shutdown:", error);
        } finally {
          process.exit(0);
        }
      };
    };
    process.on("SIGTERM", shutdown("SIGTERM"));
    process.on("SIGINT", shutdown("SIGINT"));
  } catch (error) {
    logger.error("❌ Error starting server:", error);
    process.exit(1);
  }
};

startServer();
