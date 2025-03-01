import { Redis } from "@upstash/redis";
import { createServer, Server as HttpServer } from "http";
import { Kafka, Consumer } from "kafkajs";

import { NotificationProviderFactory } from "./providers";
import { KafkaNotificationEvent } from "./types";
import app from "./app";
import { appConfig } from "./config/app.config";
import { logger } from "./config/logger.config";

class NotificationServer {
  private server: HttpServer;
  private kafka: Kafka;
  private consumer!: Consumer;
  private redis: Redis;
  private isShuttingDown = false;

  constructor() {
    this.server = createServer(app);
    this.kafka = new Kafka({
      clientId: "notification-service",
      brokers: appConfig.kafka.brokers,
    });

    this.redis = new Redis({
      url: appConfig.redis.url,
      token: appConfig.redis.token,
    });

    this.setupProcessHandlers();
  }

  private setupProcessHandlers(): void {
    process.on("uncaughtException", this.handleUncaughtException.bind(this));
    process.on("unhandledRejection", this.handleUnhandledRejection.bind(this));
    process.on("SIGTERM", () => this.shutdown());
    process.on("SIGINT", () => this.shutdown());
  }

  private handleUncaughtException(error: Error): void {
    logger.fatal("💥 Uncaught Exception:", { error });
    this.shutdown();
  }

  private handleUnhandledRejection(reason: any): void {
    logger.error("⚠️ Unhandled Rejection:", { reason });
  }

  async start() {
    try {
      await this.connectServices();
      await this.setupConsumer();
      this.startServer();

      logger.info(`
🚀 Notification Service is running!
🔊 Port: ${appConfig.port}
🌍 Environment: ${appConfig.nodeEnv}
🔄 Redis: Connected
📨 Kafka: Connected
⚡️ Status: Ready for requests
      `);
    } catch (error) {
      logger.error("💥 Failed to start notification service", { error });
      process.exit(1);
    }
  }

  private async connectServices() {
    try {
      await this.connectKafka();
      await this.connectRedis();
    } catch (error) {
      logger.error("💥 Failed to connect services", { error });
      throw error;
    }
  }

  private async connectRedis(): Promise<void> {
    try {
      // Test Redis connection
      await this.redis.ping();
      logger.info("✅ Redis connected");
    } catch (error) {
      logger.error("💥 Redis connection failed:", { error });
      throw error;
    }
  }

  private async connectKafka() {
    try {
      this.consumer = this.kafka.consumer({
        groupId: "notification-service-group",
      });
      await this.consumer.connect();
      logger.info("✅ Kafka connected");
    } catch (error) {
      logger.error("💥 Failed to connect to Kafka", { error });
      throw error;
    }
  }

  private async setupConsumer() {
    try {
      await this.consumer.subscribe({
        topic: appConfig.kafka.topics.notifications,
        fromBeginning: false,
      });

      await this.consumer.run({
        eachMessage: async ({ message }: any) => {
          if (this.isShuttingDown) return;

          try {
            const event: KafkaNotificationEvent = JSON.parse(
              message.value.toString()
            );
            logger.info("📨 Received notification event", { event });

            const result = await NotificationProviderFactory.send(
              event.payload
            );

            if (result.success) {
              await this.redis.set(
                `notification:${result.messageId}`,
                JSON.stringify({
                  ...event,
                  result,
                  processedAt: new Date().toISOString(),
                }),
                { ex: 60 * 60 * 24 } // 24 hours expiry
              );
              logger.info("✅ Notification processed successfully", {
                messageId: result.messageId,
              });
            }
          } catch (error) {
            logger.error("❌ Failed to process notification event", { error });
          }
        },
      });

      logger.info("✅ Kafka consumer setup completed");
    } catch (error) {
      logger.error("💥 Failed to setup Kafka consumer", { error });
      throw error;
    }
  }

  private startServer(): void {
    this.server.listen(appConfig.port, () => {
      logger.info(`✅ HTTP server listening on port ${appConfig.port}`);
    });

    this.server.on("error", (error: Error) => {
      logger.error("🔥 Server error:", { error });
    });
  }

  private async shutdown() {
    if (this.isShuttingDown) return;
    this.isShuttingDown = true;

    logger.info("🛑 Starting graceful shutdown...");

    try {
      await Promise.allSettled([
        new Promise<void>((resolve) => {
          this.server.close(() => {
            logger.info("✅ HTTP server closed");
            resolve();
          });
        }),
        this.consumer.disconnect().then(() => {
          logger.info("✅ Kafka disconnected");
        })
      ]);

      logger.info("✅ Redis connection closed");
      logger.info("👋 Graceful shutdown completed");
      process.exit(0);
    } catch (error) {
      logger.error("💥 Error during shutdown", { error });
      process.exit(1);
    }
  }
}

const server = new NotificationServer();
server.start();
