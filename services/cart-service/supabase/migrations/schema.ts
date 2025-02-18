import { pgTable, foreignKey, uuid, integer, timestamp, varchar, unique, text, boolean, numeric } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const cartItems = pgTable("cart_items", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	cartId: uuid("cart_id").notNull(),
	productId: uuid("product_id").notNull(),
	quantity: integer().default(1).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.cartId],
			foreignColumns: [carts.id],
			name: "cart_items_cart_id_carts_id_fk"
		}),
]);

export const carts = pgTable("carts", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	status: varchar({ length: 20 }).default('active').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const categories = pgTable("categories", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	slug: varchar({ length: 255 }).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	parentId: uuid("parent_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("categories_slug_unique").on(table.slug),
]);

export const inventories = pgTable("inventories", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	productId: uuid("product_id").notNull(),
	quantity: integer().default(0).notNull(),
	reservedQuantity: integer("reserved_quantity").default(0).notNull(),
	reorderPoint: integer("reorder_point").default(10).notNull(),
	warehouseLocation: varchar("warehouse_location", { length: 100 }),
	unitCost: numeric("unit_cost", { precision: 10, scale:  2 }),
	lastRestockedAt: timestamp("last_restocked_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("inventories_product_id_unique").on(table.productId),
]);

export const products = pgTable("products", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	price: numeric({ precision: 10, scale:  2 }).notNull(),
	sku: varchar({ length: 100 }).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	categoryId: uuid("category_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [categories.id],
			name: "products_category_id_categories_id_fk"
		}),
	unique("products_sku_unique").on(table.sku),
]);
