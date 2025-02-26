import { pgTable, foreignKey, uuid, numeric, varchar, jsonb, timestamp, boolean, integer, json, unique, text } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const refunds = pgTable("refunds", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	transactionId: uuid("transaction_id"),
	amount: numeric().notNull(),
	reason: varchar({ length: 255 }).notNull(),
	status: varchar({ length: 20 }).notNull(),
	providerRefundId: varchar("provider_refund_id", { length: 255 }),
	metadata: jsonb(),
	errorDetails: jsonb("error_details"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.transactionId],
			foreignColumns: [transactions.id],
			name: "refunds_transaction_id_transactions_id_fk"
		}),
]);

export const transactions = pgTable("transactions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	orderId: uuid("order_id").notNull(),
	paymentMethodId: uuid("payment_method_id"),
	amount: numeric().notNull(),
	currency: varchar({ length: 3 }).default('NGN').notNull(),
	status: varchar({ length: 20 }).notNull(),
	provider: varchar({ length: 50 }).notNull(),
	providerTransactionId: varchar("provider_transaction_id", { length: 255 }),
	providerReference: varchar("provider_reference", { length: 255 }),
	metadata: jsonb(),
	errorDetails: jsonb("error_details"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.paymentMethodId],
			foreignColumns: [paymentMethods.id],
			name: "transactions_payment_method_id_payment_methods_id_fk"
		}),
]);

export const paymentMethods = pgTable("payment_methods", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	type: varchar({ length: 50 }).notNull(),
	provider: varchar({ length: 50 }).notNull(),
	details: jsonb().notNull(),
	isDefault: boolean("is_default").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

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

export const orderItems = pgTable("order_items", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	orderId: uuid("order_id").notNull(),
	productId: uuid("product_id").notNull(),
	quantity: numeric().notNull(),
	unitPrice: numeric("unit_price", { precision: 10, scale:  2 }).notNull(),
	totalPrice: numeric("total_price", { precision: 10, scale:  2 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "order_items_order_id_orders_id_fk"
		}),
]);

export const orders = pgTable("orders", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	status: varchar({ length: 50 }).default('pending').notNull(),
	totalAmount: numeric("total_amount", { precision: 10, scale:  2 }).notNull(),
	shippingAddress: json("shipping_address").notNull(),
	billingAddress: json("billing_address").notNull(),
	paymentStatus: varchar("payment_status", { length: 50 }).default('pending').notNull(),
	paymentMethod: varchar("payment_method", { length: 50 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const shipments = pgTable("shipments", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	orderId: uuid("order_id").notNull(),
	status: varchar({ length: 50 }).default('pending').notNull(),
	trackingNumber: varchar("tracking_number", { length: 100 }),
	carrier: varchar({ length: 100 }).notNull(),
	shippingMethod: varchar("shipping_method", { length: 100 }).notNull(),
	estimatedDeliveryDate: timestamp("estimated_delivery_date", { mode: 'string' }),
	actualDeliveryDate: timestamp("actual_delivery_date", { mode: 'string' }),
	shippingLabel: json("shipping_label"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "shipments_order_id_orders_id_fk"
		}),
]);

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
