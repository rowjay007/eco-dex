import { relations } from "drizzle-orm/relations";
import { carts, cartItems, categories, products } from "./schema";

export const cartItemsRelations = relations(cartItems, ({one}) => ({
	cart: one(carts, {
		fields: [cartItems.cartId],
		references: [carts.id]
	}),
}));

export const cartsRelations = relations(carts, ({many}) => ({
	cartItems: many(cartItems),
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