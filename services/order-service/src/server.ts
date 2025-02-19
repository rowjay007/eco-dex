import { config } from "dotenv";
import app from "./app";
import { db } from "./config/database.config";
import redisClient from "./config/redis.config";
import { connectKafka, disconnectKafka } from "./config/kafka.config";
import logger from "./utils/logger";

config();

const startServer = async () => {
  try {
    await db.execute("SELECT 1");
    logger.info("✅ Database connection successful");

    try {
      await redisClient.get("connection-test");
      logger.info("✅ Redis connection successful");
    } catch (error) {
      logger.warn("⚠️ Redis connection failed - continuing without cache");
    }

    try {
      await connectKafka();
      logger.info("✅ Kafka connection successful");
    } catch (error) {
      logger.error("❌ Kafka connection failed", error);
      process.exit(1);
    }

    const port = process.env.PORT || 3000;
    const server = app.listen(port, () => {
      logger.info(`🚀 Order Service is running on port ${port}`);
      logger.info(`🔗 Health check endpoint: http://localhost:${port}/health`);
      logger.info(
        `📦 Order endpoints available at http://localhost:${port}/api/orders`
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

          await disconnectKafka();
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
