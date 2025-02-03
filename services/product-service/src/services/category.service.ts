import { eq } from "drizzle-orm";
import { cacheService } from "../cache/cache.service";
import { db } from "../config/database.config";
import type { Category, NewCategory } from "../models/category.model";
import { categories } from "../models/category.model";
import { AppError } from "../utils/AppError";

export const createCategory = async (data: NewCategory): Promise<Category> => {
  const category = (await db.insert(categories).values(data).returning())[0];
  await cacheService.set(
    cacheService.generateCategoryKey(category.id),
    category
  );
  return category;
};

export const getCategory = async (id: string): Promise<Category> => {
  const cachedCategory = await cacheService.get<Category>(
    cacheService.generateCategoryKey(id)
  );
  if (cachedCategory) return cachedCategory;

  const category = await db.query.categories.findFirst({
    where: eq(categories.id, id),
    with: {
      products: true,
      parent: true,
      children: true,
    },
  });

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  await cacheService.set(cacheService.generateCategoryKey(id), category);
  return category;
};

export const updateCategory = async (
  id: string,
  data: Partial<NewCategory>
): Promise<Category> => {
  const category = (
    await db
      .update(categories)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning()
  )[0];

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  await cacheService.set(cacheService.generateCategoryKey(id), category);
  return category;
};

export const deleteCategory = async (id: string): Promise<void> => {
  const category = await getCategory(id);

  if (category.children && category.children.length > 0) {
    throw new AppError("Cannot delete category with subcategories", 400);
  }

  if (category.products && category.products.length > 0) {
    throw new AppError("Cannot delete category with associated products", 400);
  }

  await db.delete(categories).where(eq(categories.id, id));
  await cacheService.del(cacheService.generateCategoryKey(id));
  await cacheService.del(cacheService.generateCategoryListKey());
};

export const listCategories = async (): Promise<Category[]> => {
  const cacheKey = cacheService.generateCategoryListKey();
  const cachedCategories = await cacheService.get<Category[]>(cacheKey);

  if (cachedCategories) return cachedCategories;

  const categoriesList = await db.query.categories.findMany({
    with: {
      parent: true,
      children: true,
    },
  });

  await cacheService.set(cacheKey, categoriesList);
  return categoriesList;
};

export const getCategoryHierarchy = async (): Promise<Category[]> => {
  const categories = await listCategories();
  return categories.filter((category) => !category.parentId);
};

export const categoryService = {
  createCategory,
  getCategory,
  updateCategory,
  deleteCategory,
  listCategories,
  getCategoryHierarchy,
};
