import { relations } from "drizzle-orm";
import {
  boolean,
  decimal,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { categories } from "./category.model.js";
import { inventories } from "./inventory.model.js";

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  sku: varchar("sku", { length: 100 }).notNull().unique(),
  isActive: boolean("is_active").default(true).notNull(),
  categoryId: uuid("category_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const productsRelations = relations(products, ({ one }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  inventory: one(inventories, {
    fields: [products.id],
    references: [inventories.productId],
  }),
}));

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
