import { redisClient } from "../config/redis.config";

export class CacheService {
  private readonly DEFAULT_TTL = 3600; // 1 hour in seconds

  async get<T>(key: string): Promise<T | null> {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  }

  async set(
    key: string,
    value: any,
    ttl: number = this.DEFAULT_TTL
  ): Promise<void> {
    await redisClient.setEx(key, ttl, JSON.stringify(value));
  }

  async del(key: string): Promise<void> {
    await redisClient.del(key);
  }

  async delByPattern(pattern: string): Promise<void> {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  }

  generateKey(prefix: string, identifier: string): string {
    return `${prefix}:${identifier}`;
  }

  // Product-specific cache methods
  generateProductKey(productId: string): string {
    return this.generateKey("product", productId);
  }

  generateProductListKey(page: number, limit: number): string {
    return `products:list:${page}:${limit}`;
  }

  // Category-specific cache methods
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
