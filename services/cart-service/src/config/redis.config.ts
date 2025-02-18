import { Redis } from "@upstash/redis";
import { config } from "dotenv";
import logger from "../utils/logger";

config();

const upstashClient = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL as string,
  token: process.env.UPSTASH_REDIS_REST_TOKEN as string,
});

interface CartItem {
  productId: string;
  quantity: number;
}

interface Cart {
  id: string;
}

const redisClient = {
  get: async (key: string): Promise<string | null> => {
    try {
      const result = await upstashClient.get(key);
      return result as string | null;
    } catch (error) {
      logger.warn("Redis GET operation failed:", error);
      return null;
    }
  },

  setEx: async (key: string, ttl: number, value: string): Promise<void> => {
    try {
      await upstashClient.set(key, value, { ex: ttl });
    } catch (error) {
      logger.warn("Redis SETEX operation failed:", error);
    }
  },

  del: async (key: string | string[]): Promise<void> => {
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

  keys: async (pattern: string): Promise<string[]> => {
    try {
      const result = await upstashClient.keys(pattern);
      return result as string[];
    } catch (error) {
      logger.warn("Redis KEYS operation failed:", error);
      return [];
    }
  },
};

export { redisClient };
export default redisClient;

