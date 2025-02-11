import { redisClient } from "../config/upstash.config";
import logger from "../utils/logger";

export class CacheService {
  private readonly DEFAULT_TTL = 3600;
  private isRedisAvailable = true;

  private async executeRedisOperation<T>(
    operation: () => Promise<T>,
    fallbackValue: T
  ): Promise<T> {
    if (!this.isRedisAvailable) {
      return fallbackValue;
    }

    try {
      return await operation();
    } catch (error) {
      logger.warn(`Redis operation failed: ${error.message}`);
      this.isRedisAvailable = false;
      return fallbackValue;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    return this.executeRedisOperation(async () => {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data as string) : null;
    }, null);
  }

  async set<T>(
    key: string,
    value: T,
    ttl: number = this.DEFAULT_TTL
  ): Promise<void> {
    await this.executeRedisOperation(async () => {
      await redisClient.setEx(key, ttl, JSON.stringify(value));
    }, undefined);
  }

  async del(key: string): Promise<void> {
    await this.executeRedisOperation(async () => {
      await redisClient.del(key);
    }, undefined);
  }

  async delByPattern(pattern: string): Promise<void> {
    await this.executeRedisOperation(async () => {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    }, undefined);
  }

  generateKey(prefix: string, identifier: string): string {
    return `${prefix}:${identifier}`;
  }

  generateProductKey(productId: string): string {
    return this.generateKey("product", productId);
  }

  generateProductListKey(page: number, limit: number): string {
    return `products:list:${page}:${limit}`;
  }

  generateCategoryKey(categoryId: string): string {
    return this.generateKey("category", categoryId);
  }

  generateCategoryListKey(): string {
    return "categories:list";
  }

  generateInventoryKey(productId: string): string {
    return this.generateKey("inventory", productId);
  }
}

export const cacheService = new CacheService();
