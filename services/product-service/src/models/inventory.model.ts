import { relations } from "drizzle-orm";
import {
  decimal,
  integer,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { products } from "./product.model";

export const inventories = pgTable("inventories", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id").notNull().unique(),
  quantity: integer("quantity").notNull().default(0),
  reservedQuantity: integer("reserved_quantity").notNull().default(0),
  reorderPoint: integer("reorder_point").notNull().default(10),
  warehouseLocation: varchar("warehouse_location", { length: 100 }),
  unitCost: decimal("unit_cost", { precision: 10, scale: 2 }),
  lastRestockedAt: timestamp("last_restocked_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const inventoriesRelations = relations(inventories, ({ one }) => ({
  product: one(products, {
    fields: [inventories.productId],
    references: [products.id],
  }),
}));

export type Inventory = typeof inventories.$inferSelect;
export type NewInventory = typeof inventories.$inferInsert;
