import { config } from "dotenv";
import Redis from "ioredis";
import logger from "../utils/logger";

config();

const redisConfig = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379", 10),
};

const redis = new Redis(redisConfig);

redis.on("error", (error) => {
  logger.error("Redis connection error:", error);
});

redis.on("connect", () => {
  logger.info("✅ Redis connection successful");
});

export default redis;