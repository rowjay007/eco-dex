import { app } from './app';
import { config, isDevelopment } from './config/app.config';
import { logger } from './config/logger.config';
import { db, client } from './config/db.config';
import { redis } from './config/redis.config';
import { producer, consumer } from './config/kafka.config';
import { createServer, Server as HttpServer } from 'http';
import { sql } from 'drizzle-orm';

class Server {
  private server: HttpServer;

  constructor() {
    this.server = createServer(app);
    this.setupProcessHandlers();
  }

  private setupProcessHandlers(): void {
    process.on('uncaughtException', this.handleUncaughtException.bind(this));
    process.on('unhandledRejection', this.handleUnhandledRejection.bind(this));
    process.on('SIGTERM', this.handleGracefulShutdown.bind(this));
    process.on('SIGINT', this.handleGracefulShutdown.bind(this));
  }

  private handleUncaughtException(error: Error): void {
    logger.fatal('💥 Uncaught Exception:', { error });
    this.handleGracefulShutdown();
  }

  private handleUnhandledRejection(reason: any): void {
    logger.error('⚠️ Unhandled Rejection:', { reason });
  }

  private async handleGracefulShutdown(): Promise<void> {
    logger.info('🛑 Starting graceful shutdown...');

    try {
      // Stop accepting new requests
      await this.closeHttpServer();
      
      // Disconnect all services
      await Promise.allSettled([
        this.disconnectDatabase(),
        this.disconnectRedis(),
        this.disconnectKafka()
      ]);

      logger.info('✅ Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      logger.error('💥 Error during shutdown:', { error });
      process.exit(1);
    }
  }

  private async closeHttpServer(): Promise<void> {
    return new Promise((resolve) => {
      this.server.close(() => {
        logger.info('🚫 HTTP server closed');
        resolve();
      });
    });
  }

  private async connectDatabase(): Promise<void> {
    try {
      // Test the connection using drizzle
      const result = await db.execute(sql`SELECT NOW()`);
      if (!result || !result[0]) {
        throw new Error('Database connection test failed');
      }
      logger.info('🗄️  Database connected', { 
        timestamp: result[0].now,
        url: config.DATABASE_URL.split('@')[1] // Log only host part of URL
      });
    } catch (error) {
      logger.error('💥 Database connection failed:', { error });
      throw error;
    }
  }

  private async connectRedis(): Promise<void> {
    try {
      // Test Redis connection with Upstash
      const ping = await redis.ping();
      if (ping !== 'PONG') {
        throw new Error('Redis ping failed');
      }
      logger.info('🔄 Redis connected');
    } catch (error) {
      logger.error('💥 Redis connection failed:', { error });
      throw error;
    }
  }

  private async connectKafka(): Promise<void> {
    if (isDevelopment(config.NODE_ENV)) {
      logger.info('⚠️ Skipping Kafka connection in development mode');
      return;
    }
    try {
      await Promise.all([
        producer.connect(),
        consumer.connect()
      ]);
      logger.info('📨 Kafka connected');
    } catch (error) {
      logger.error('💥 Kafka connection failed:', { error });
      if (!isDevelopment(config.NODE_ENV)) {
        throw error;
      }
    }
  }

  private async disconnectDatabase(): Promise<void> {
    try {
      await client.end();
      logger.info('🔌 Database pool closed');
    } catch (error) {
      logger.error('💥 Database disconnect failed:', { error });
    }
  }

  private async disconnectRedis(): Promise<void> {
    try {
      // Upstash Redis REST client doesn't need explicit disconnection
      logger.info('🔌 Redis connection closed');
    } catch (error) {
      logger.error('💥 Redis disconnect failed:', { error });
    }
  }

  private async disconnectKafka(): Promise<void> {
    if (isDevelopment(config.NODE_ENV)) {
      return;
    }
    try {
      await Promise.all([
        producer.disconnect(),
        consumer.disconnect()
      ]);
      logger.info('🔌 Kafka disconnected');
    } catch (error) {
      logger.error('💥 Kafka disconnect failed:', { error });
    }
  }

  public async start(): Promise<void> {
    try {
      // Connect all services
      await Promise.all([
        this.connectDatabase(),
        this.connectRedis(),
        this.connectKafka()
      ]);

      // Start HTTP server
      this.server.listen(config.PORT, () => {
        logger.info(`
🚀 Payment Service is running!
🔊 Port: ${config.PORT}
🌍 Environment: ${config.NODE_ENV}
🗄️  Database: Connected
🔄 Redis: Connected
📨 Kafka: Connected
⚡️ Status: Ready for requests
        `);
      });

      this.server.on('error', (error: Error) => {
        logger.error('🔥 Server error:', { error });
      });

    } catch (error) {
      logger.error('💥 Failed to start server:', { error });
      await this.handleGracefulShutdown();
    }
  }
}

const server = new Server();
server.start().catch((error) => {
  logger.fatal('💥 Fatal startup error:', { error });
  process.exit(1);
});
