import { eq, sql } from "drizzle-orm";
import { cacheService } from "../cache/cache.service";
import { db } from "../config/database.config";
import type { Inventory, NewInventory } from "../models/inventory.model";
import { inventories } from "../models/inventory.model";
import { AppError } from "../utils/AppError";

const createInventory = async (data: NewInventory): Promise<Inventory> => {
  const inventory = (await db.insert(inventories).values(data).returning())[0];
  await cacheService.set(
    cacheService.generateInventoryKey(inventory.productId),
    inventory
  );
  return inventory;
};

const getInventory = async (productId: string): Promise<Inventory> => {
  const cachedInventory = await cacheService.get<Inventory>(
    cacheService.generateInventoryKey(productId)
  );
  if (cachedInventory) return cachedInventory;

  const inventory = await db.query.inventories.findFirst({
    where: eq(inventories.productId, productId),
    with: {
      product: true,
    },
  });

  if (!inventory) {
    throw new AppError("Inventory not found", 404);
  }

  await cacheService.set(
    cacheService.generateInventoryKey(productId),
    inventory
  );
  return inventory;
};

const updateInventory = async (
  productId: string,
  data: Partial<NewInventory>
): Promise<Inventory> => {
  const inventory = (
    await db
      .update(inventories)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(inventories.productId, productId))
      .returning()
  )[0];

  if (!inventory) {
    throw new AppError("Inventory not found", 404);
  }

  await cacheService.set(
    cacheService.generateInventoryKey(productId),
    inventory
  );
  return inventory;
};

const reserveStock = async (
  productId: string,
  quantity: number
): Promise<Inventory> => {
  const inventory = await getInventory(productId);

  if (inventory.quantity - inventory.reservedQuantity < quantity) {
    throw new AppError("Insufficient stock available", 400);
  }

  return updateInventory(productId, {
    reservedQuantity: inventory.reservedQuantity + quantity,
  });
};

const releaseStock = async (
  productId: string,
  quantity: number
): Promise<Inventory> => {
  const inventory = await getInventory(productId);

  if (inventory.reservedQuantity < quantity) {
    throw new AppError("Cannot release more stock than reserved", 400);
  }

  return updateInventory(productId, {
    reservedQuantity: inventory.reservedQuantity - quantity,
  });
};

const adjustStock = async (
  productId: string,
  adjustment: number
): Promise<Inventory> => {
  const inventory = await getInventory(productId);
  const newQuantity = inventory.quantity + adjustment;

  if (newQuantity < 0) {
    throw new AppError(
      "Stock adjustment would result in negative quantity",
      400
    );
  }

  return updateInventory(productId, {
    quantity: newQuantity,
    lastRestockedAt: adjustment > 0 ? new Date() : inventory.lastRestockedAt,
  });
};

const checkLowStock = async (
  reorderThreshold?: number
): Promise<Inventory[]> => {
  return db.query.inventories.findMany({
    where: reorderThreshold
      ? sql`${inventories.quantity} <= ${reorderThreshold}`
      : sql`${inventories.quantity} <= ${inventories.reorderPoint}`,
    with: {
      product: true,
    },
  });
};

export const inventoryService = {
  createInventory,
  getInventory,
  updateInventory,
  reserveStock,
  releaseStock,
  adjustStock,
  checkLowStock,
};
