import { relations, InferSelectModel, InferInsertModel } from "drizzle-orm";
import {
  boolean,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { products } from "./product.model";

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  isActive: boolean("is_active").default(true).notNull(),
  parentId: uuid("parent_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type CategorySelect = InferSelectModel<typeof categories>;
export type CategoryInsert = InferInsertModel<typeof categories>;

export const categoriesRelations = relations(categories, ({ many, one }) => ({
  products: many(products),
  parent: one(categories),
  children: many(categories),
}));


export interface Category extends CategorySelect {
  products?: InferSelectModel<typeof products>[];
  parent?: CategorySelect;
  children?: CategorySelect[];
}
