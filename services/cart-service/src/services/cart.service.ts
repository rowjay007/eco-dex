import { eq } from "drizzle-orm";
import { db } from "../config/database.config";
import { cartItems, carts, type Cart, type CartItem } from "../models/cart.model";
import logger from "../utils/logger";
import { RedisService } from "./redis.service";

export class CartService {
  static async createCart(userId: string): Promise<Cart> {
    try {
      const [cart] = await db
        .insert(carts)
        .values({ userId })
        .returning();

      await RedisService.setCart(cart.id, cart);
      return cart;
    } catch (error) {
      logger.error("Error creating cart:", error);
      throw error;
    }
  }

  static async getCart(cartId: string): Promise<Cart | null> {
    try {
      const cachedCart = await RedisService.getCart(cartId);
      if (cachedCart) return cachedCart;

      const cart = await db
        .select()
        .from(carts)
        .where(eq(carts.id, cartId))
        .then((res) => res[0] || null);

      if (cart) await RedisService.setCart(cartId, cart);
      return cart;
    } catch (error) {
      logger.error("Error getting cart:", error);
      throw error;
    }
  }

  static async addItemToCart(cartId: string, productId: string, quantity: number): Promise<CartItem> {
    try {
      const [item] = await db
        .insert(cartItems)
        .values({ cartId, productId, quantity })
        .returning();

      const items = await this.getCartItems(cartId);
      items.push(item);
      await RedisService.setCartItems(cartId, items);

      return item;
    } catch (error) {
      logger.error("Error adding item to cart:", error);
      throw error;
    }
  }

  static async getCartItems(cartId: string): Promise<CartItem[]> {
    try {
      const cachedItems = await RedisService.getCartItems(cartId);
      if (cachedItems) return cachedItems;

      const items = await db
        .select()
        .from(cartItems)
        .where(eq(cartItems.cartId, cartId));

      await RedisService.setCartItems(cartId, items);
      return items;
    } catch (error) {
      logger.error("Error getting cart items:", error);
      throw error;
    }
  }

  static async updateCartItemQuantity(cartId: string, productId: string, quantity: number): Promise<CartItem | null> {
    try {
      const [updatedItem] = await db
        .update(cartItems)
        .set({ quantity, updatedAt: new Date() })
        .where(eq(cartItems.cartId, cartId) && eq(cartItems.productId, productId))
        .returning();

      if (updatedItem) {
        await RedisService.updateCartItemQuantity(cartId, productId, quantity);
      }

      return updatedItem || null;
    } catch (error) {
      logger.error("Error updating cart item quantity:", error);
      throw error;
    }
  }

  static async removeCartItem(cartId: string, productId: string): Promise<void> {
    try {
      await db
        .delete(cartItems)
        .where(eq(cartItems.cartId, cartId) && eq(cartItems.productId, productId));

      const items = await this.getCartItems(cartId);
      const updatedItems = items.filter(item => item.productId !== productId);
      await RedisService.setCartItems(cartId, updatedItems);
    } catch (error) {
      logger.error("Error removing cart item:", error);
      throw error;
    }
  }

  static async deleteCart(cartId: string): Promise<void> {
    try {
      await db.delete(carts).where(eq(carts.id, cartId));
      await RedisService.deleteCart(cartId);
    } catch (error) {
      logger.error("Error deleting cart:", error);
      throw error;
    }
  }
}