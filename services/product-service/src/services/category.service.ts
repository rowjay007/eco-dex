import { eq } from "drizzle-orm";
import slugify from "slugify";
import { z } from "zod";
import { cacheService } from "../cache/cache.service";
import { db } from "../config/database.config";
import type { Category } from "../models/category.model";
import { categories } from "../models/category.model";
import { AppError } from "../utils/AppError";

// Validation schemas
const categorySchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  parentId: z.string().uuid().optional(),
});

type ValidatedCategory = z.infer<typeof categorySchema>;

// Helper functions
const formatZodError = (error: z.ZodError) => {
  const { fieldErrors } = error.flatten();
  const formattedErrors: Record<string, string> = {};

  Object.entries(fieldErrors).forEach(([key, errors]) => {
    if (errors && errors.length > 0) {
      formattedErrors[key] = errors.join(", ");
    }
  });

  return formattedErrors;
};

const validateInput = (data: unknown): ValidatedCategory => {
  try {
    return categorySchema.parse(data);
  } catch (error) {
    throw new AppError(
      "Invalid category data",
      400,
      error instanceof z.ZodError ? formatZodError(error) : undefined
    );
  }
};


const generateSlug = (name: string): string =>
  slugify(name, { lower: true, strict: true, trim: true });

const checkSlugUniqueness = async (slug: string): Promise<void> => {
  const existing = await db.query.categories.findFirst({
    where: eq(categories.slug, slug),
  });

  if (existing) {
    throw new AppError("Category with this name already exists", 409);
  }
};

const validateParentCategory = async (parentId?: string): Promise<void> => {
  if (!parentId) return;

  const parent = await db.query.categories.findFirst({
    where: eq(categories.id, parentId),
  });

  if (!parent) {
    throw new AppError("Parent category not found", 404);
  }
};

const updateCache = async (category: Category): Promise<void> => {
  try {
    await Promise.all([
      cacheService.set(cacheService.generateCategoryKey(category.id), category),
      cacheService.del(cacheService.generateCategoryListKey()),
    ]);
  } catch (error) {
    // Log error but don't fail the operation
    console.warn("Cache update failed:", error);
  }
};

// Main functions
export const createCategory = async (data: unknown): Promise<Category> => {
  const validated = validateInput(data);
  const slug = generateSlug(validated.name);

  await Promise.all([
    checkSlugUniqueness(slug),
    validateParentCategory(validated.parentId),
  ]);

  try {
    const category = (
      await db
        .insert(categories)
        .values({ ...validated, slug })
        .returning()
    )[0];

    await updateCache(category);
    return category;
  } catch (error) {
    throw new AppError("Failed to create category", 500);
  }
};

export const getCategory = async (id: string): Promise<Category> => {
  const cachedCategory = await cacheService.get<Category>(
    cacheService.generateCategoryKey(id)
  );

  if (cachedCategory) return cachedCategory;

  const category = await db.query.categories.findFirst({
    where: eq(categories.id, id),
    with: { products: true, parent: true, children: true },
  });

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  await cacheService.set(cacheService.generateCategoryKey(id), category);
  return category;
};

export const updateCategory = async (
  id: string,
  data: unknown
): Promise<Category> => {
  const validated = validateInput(data);

  if (validated.name) {
    const slug = generateSlug(validated.name);
    await checkSlugUniqueness(slug);
  }

  if (validated.parentId) {
    await validateParentCategory(validated.parentId);
  }

  try {
    const category = (
      await db
        .update(categories)
        .set({ ...validated, updatedAt: new Date() })
        .where(eq(categories.id, id))
        .returning()
    )[0];

    if (!category) {
      throw new AppError("Category not found", 404);
    }

    await updateCache(category);
    return category;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to update category", 500);
  }
};

export const deleteCategory = async (id: string): Promise<void> => {
  const category = await getCategory(id);

  if (category.children?.length > 0) {
    throw new AppError("Cannot delete category with subcategories", 400);
  }

  if (category.products?.length > 0) {
    throw new AppError("Cannot delete category with associated products", 400);
  }

  try {
    await db.delete(categories).where(eq(categories.id, id));
    await Promise.all([
      cacheService.del(cacheService.generateCategoryKey(id)),
      cacheService.del(cacheService.generateCategoryListKey()),
    ]);
  } catch (error) {
    throw new AppError("Failed to delete category", 500);
  }
};

export const listCategories = async (): Promise<Category[]> => {
  const cacheKey = cacheService.generateCategoryListKey();
  const cachedCategories = await cacheService.get<Category[]>(cacheKey);

  if (cachedCategories) return cachedCategories;

  try {
    const categories = await db.query.categories.findMany({
      with: { parent: true, children: true },
    });

    await cacheService.set(cacheKey, categories);
    return categories;
  } catch (error) {
    throw new AppError("Failed to fetch categories", 500);
  }
};

export const getCategoryHierarchy = async (): Promise<Category[]> => {
  const categories = await listCategories();
  return categories.filter((category) => !category.parentId);
};
