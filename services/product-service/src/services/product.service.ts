import { eq, sql } from "drizzle-orm";
import { cacheService } from "../cache/cache.service";
import { db } from "../config/database.config";
import type { NewProduct, Product } from "../models/product.model";
import { products } from "../models/product.model";
import { AppError } from "../utils/AppError";

export class ProductService {
  async createProduct(data: NewProduct): Promise<Product> {
    const product = (await db.insert(products).values(data).returning())[0];
    await cacheService.set(
      cacheService.generateProductKey(product.id),
      product
    );
    return product;
  }

  async getProduct(id: string): Promise<Product> {
    const cachedProduct = await cacheService.get<Product>(
      cacheService.generateProductKey(id)
    );
    if (cachedProduct) return cachedProduct;

    const product = await db.query.products.findFirst({
      where: eq(products.id, id),
      with: {
        category: true,
        inventory: true,
      },
    });

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    await cacheService.set(cacheService.generateProductKey(id), product);
    return product;
  }

  async updateProduct(id: string, data: Partial<NewProduct>): Promise<Product> {
    const product = (
      await db
        .update(products)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(products.id, id))
        .returning()
    )[0];

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    await cacheService.set(cacheService.generateProductKey(id), product);
    return product;
  }

  async deleteProduct(id: string): Promise<void> {
    const result = await db
      .delete(products)
      .where(eq(products.id, id))
      .returning();
    if (!result.length) {
      throw new AppError("Product not found", 404);
    }
    await cacheService.del(cacheService.generateProductKey(id));
  }

  async listProducts(
    page: number = 1,
    limit: number = 10
  ): Promise<{ products: Product[]; total: number }> {
    const offset = (page - 1) * limit;
    const cacheKey = cacheService.generateProductListKey(page, limit);

    const cachedResult = await cacheService.get<{
      products: Product[];
      total: number;
    }>(cacheKey);
    if (cachedResult) return cachedResult;

    const [productsResult, totalResult] = await Promise.all([
      db.query.products.findMany({
        limit,
        offset,
        with: {
          category: true,
          inventory: true,
        },
      }),
      db.select({ count: sql<number>`count(*)` }).from(products),
    ]);

    const result = {
      products: productsResult,
      total: Number(totalResult[0].count),
    };

    await cacheService.set(cacheKey, result);
    return result;
  }

  async searchProducts(query: string): Promise<Product[]> {
    return db.query.products.findMany({
      where: sql`to_tsvector('english', ${products.name} || ' ' || ${products.description}) @@ to_tsquery('english', ${query})`,
      with: {
        category: true,
        inventory: true,
      },
    });
  }
}

export const productService = new ProductService();
