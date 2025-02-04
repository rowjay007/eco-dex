import { config } from "dotenv";
import app from "./app";
import { db } from "./config/database.config";
import { connectRedis } from "./config/redis.config";
import logger from "./utils/logger";

config();

const startServer = async () => {
  try {
    await db.execute("SELECT 1");
    logger.info("✅ Database connection successful");

    await connectRedis();
    logger.info("✅ Redis connection successful");

    const port = process.env.PORT || 3000;
    const server = app.listen(port, () => {
      logger.info(`🚀 Product Service is running on port ${port}`);
      logger.info(`🔗 Health check endpoint: http://localhost:${port}/health`);
      logger.info(
        `📦 Product endpoints available at http://localhost:${port}/products`
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
