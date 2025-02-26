import { relations } from "drizzle-orm/relations";
import { transactions, refunds, paymentMethods, carts, cartItems, orders, orderItems, shipments, categories, products } from "./schema";

export const refundsRelations = relations(refunds, ({one}) => ({
	transaction: one(transactions, {
		fields: [refunds.transactionId],
		references: [transactions.id]
	}),
}));

export const transactionsRelations = relations(transactions, ({one, many}) => ({
	refunds: many(refunds),
	paymentMethod: one(paymentMethods, {
		fields: [transactions.paymentMethodId],
		references: [paymentMethods.id]
	}),
}));

export const paymentMethodsRelations = relations(paymentMethods, ({many}) => ({
	transactions: many(transactions),
}));

export const cartItemsRelations = relations(cartItems, ({one}) => ({
	cart: one(carts, {
		fields: [cartItems.cartId],
		references: [carts.id]
	}),
}));

export const cartsRelations = relations(carts, ({many}) => ({
	cartItems: many(cartItems),
}));

export const orderItemsRelations = relations(orderItems, ({one}) => ({
	order: one(orders, {
		fields: [orderItems.orderId],
		references: [orders.id]
	}),
}));

export const ordersRelations = relations(orders, ({many}) => ({
	orderItems: many(orderItems),
	shipments: many(shipments),
}));

export const shipmentsRelations = relations(shipments, ({one}) => ({
	order: one(orders, {
		fields: [shipments.orderId],
		references: [orders.id]
	}),
}));

export const productsRelations = relations(products, ({one}) => ({
	category: one(categories, {
		fields: [products.categoryId],
		references: [categories.id]
	}),
}));

export const categoriesRelations = relations(categories, ({many}) => ({
	products: many(products),
}));