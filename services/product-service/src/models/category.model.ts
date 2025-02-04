import { relations } from "drizzle-orm";
import {
  boolean,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { products } from "./product.model";

export const categories: any = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  isActive: boolean("is_active").default(true).notNull(),
  parentId: uuid("parent_id").references(() => categories.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const categoriesRelations = relations(categories, ({ many, one }) => ({
  products: many(products),
  parent: one(categories),
  children: many(categories),
}));

export type Category = typeof categories.$inferSelect & {
  products?: (typeof products.$inferSelect)[];
  parent?: typeof categories.$inferSelect;
  children?: (typeof categories.$inferSelect)[];
};
export type NewCategory = typeof categories.$inferInsert;
