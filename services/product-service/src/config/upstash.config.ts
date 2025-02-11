import { Redis } from "@upstash/redis";
import { config } from "dotenv";
import logger from "../utils/logger";

config();

const upstashClient = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const redisClient = {
  get: async (key: string) => {
    try {
      return await upstashClient.get(key);
    } catch (error) {
      logger.warn("Redis GET operation failed:", error);
      return null;
    }
  },

  setEx: async (key: string, ttl: number, value: string) => {
    try {
      await upstashClient.set(key, value, { ex: ttl });
    } catch (error) {
      logger.warn("Redis SETEX operation failed:", error);
    }
  },

  del: async (key: string | string[]) => {
    try {
      if (Array.isArray(key)) {
        await Promise.all(key.map((k) => upstashClient.del(k)));
      } else {
        await upstashClient.del(key);
      }
    } catch (error) {
      logger.warn("Redis DEL operation failed:", error);
    }
  },

  keys: async (pattern: string) => {
    try {
      return await upstashClient.keys(pattern);
    } catch (error) {
      logger.warn("Redis KEYS operation failed:", error);
      return [];
    }
  },
};

export { redisClient };
