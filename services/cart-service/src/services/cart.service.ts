import { eq } from "drizzle-orm";
import { db } from "../config/database.config";
import { cartItems, carts, type Cart, type CartItem } from "../models/cart.model";
import { AppError } from "../utils/AppError";
import logger from "../utils/logger";
import * as RedisService from "./redis.service";

export const createCart = async (userId: string): Promise<Cart> => {
  try {
    const [cart] = await db
      .insert(carts)
      .values({ userId })
      .returning();

    await RedisService.setCart(cart.id, cart);
    return cart;
  } catch (error) {
    logger.error("Error creating cart:", error);
    throw new AppError("Failed to create cart", 500);
  }
};

export const getCart = async (cartId: string): Promise<Cart | null> => {
  try {
    const cachedCart = await RedisService.getCart(cartId);
    if (cachedCart) return cachedCart;

    const cart = await db
      .select()
      .from(carts)
      .where(eq(carts.id, cartId))
      .then((res) => res[0] || null);

    if (!cart) {
      throw new AppError("Cart not found", 404);
    }

    await RedisService.setCart(cartId, cart);
    return cart;
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error("Error getting cart:", error);
    throw new AppError("Failed to get cart", 500);
  }
};

export const addItemToCart = async (cartId: string, productId: string, quantity: number): Promise<CartItem> => {
  try {
    const cart = await getCart(cartId);
    if (!cart) {
      throw new AppError("Cart not found", 404);
    }

    const [item] = await db
      .insert(cartItems)
      .values({ cartId, productId, quantity })
      .returning();

    const items = await getCartItems(cartId);
    items.push(item);
    await RedisService.setCartItems(cartId, items);

    return item;
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error("Error adding item to cart:", error);
    throw new AppError("Failed to add item to cart", 500);
  }
};

export const getCartItems = async (cartId: string): Promise<CartItem[]> => {
  try {
    const cart = await getCart(cartId);
    if (!cart) {
      throw new AppError("Cart not found", 404);
    }

    const cachedItems = await RedisService.getCartItems(cartId);
    if (cachedItems) return cachedItems;

    const items = await db
      .select()
      .from(cartItems)
      .where(eq(cartItems.cartId, cartId));

    await RedisService.setCartItems(cartId, items);
    return items;
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error("Error getting cart items:", error);
    throw new AppError("Failed to get cart items", 500);
  }
};

export const updateCartItemQuantity = async (cartId: string, productId: string, quantity: number): Promise<CartItem> => {
  try {
    const cart = await getCart(cartId);
    if (!cart) {
      throw new AppError("Cart not found", 404);
    }

    const [updatedItem] = await db
      .update(cartItems)
      .set({ quantity, updatedAt: new Date() })
      .where(eq(cartItems.cartId, cartId) && eq(cartItems.productId, productId))
      .returning();

    if (!updatedItem) {
      throw new AppError("Cart item not found", 404);
    }

    await RedisService.updateCartItemQuantity(cartId, productId, quantity);
    return updatedItem;
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error("Error updating cart item quantity:", error);
    throw new AppError("Failed to update cart item quantity", 500);
  }
};

export const removeCartItem = async (cartId: string, productId: string): Promise<void> => {
  try {
    const cart = await getCart(cartId);
    if (!cart) {
      throw new AppError("Cart not found", 404);
    }

    await db
      .delete(cartItems)
      .where(eq(cartItems.cartId, cartId) && eq(cartItems.productId, productId));

    const items = await getCartItems(cartId);
    const updatedItems = items.filter(item => item.productId !== productId);
    await RedisService.setCartItems(cartId, updatedItems);
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error("Error removing cart item:", error);
    throw new AppError("Failed to remove cart item", 500);
  }
};

export const deleteCart = async (cartId: string): Promise<void> => {
  try {
    const cart = await getCart(cartId);
    if (!cart) {
      throw new AppError("Cart not found", 404);
    }

    await db.delete(carts).where(eq(carts.id, cartId));
    await RedisService.deleteCart(cartId);
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error("Error deleting cart:", error);
    throw new AppError("Failed to delete cart", 500);
  }
};