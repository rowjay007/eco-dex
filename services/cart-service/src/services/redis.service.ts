import redis from "../config/redis.config";
import logger from "../utils/logger";

export class RedisService {
  private static readonly CART_PREFIX = "cart:";
  private static readonly CART_ITEMS_PREFIX = "cart_items:";
  private static readonly CART_TTL = 60 * 60 * 24 * 7; 

  static async getCart(cartId: string) {
    try {
      const cart = await redis.get(`${this.CART_PREFIX}${cartId}`);
      return cart ? JSON.parse(cart) : null;
    } catch (error) {
      logger.error("Error getting cart from Redis:", error);
      return null;
    }
  }

  static async setCart(cartId: string, cart: Record<string, any>) {
    try {
      await redis.setEx(
        `${this.CART_PREFIX}${cartId}`,
        this.CART_TTL,
        JSON.stringify(cart)
      );
    } catch (error) {
      logger.error("Error setting cart in Redis:", error);
    }
  }

  static async setCartItems(cartId: string, items: Record<string, any>[]) {
    try {
      await redis.setEx(
        `${this.CART_ITEMS_PREFIX}${cartId}`,
        this.CART_TTL,
        JSON.stringify(items)
      );
    } catch (error) {
      logger.error("Error setting cart items in Redis:", error);
    }
  }

  static async deleteCart(cartId: string) {
    try {
      await Promise.all([
        redis.del(`${this.CART_PREFIX}${cartId}`),
        redis.del(`${this.CART_ITEMS_PREFIX}${cartId}`),
      ]);
    } catch (error) {
      logger.error("Error deleting cart from Redis:", error);
    }
  }

  static async getCartItems(cartId: string) {
    try {
      const items = await redis.get(`${this.CART_ITEMS_PREFIX}${cartId}`);
      return items ? JSON.parse(items) : null;
    } catch (error) {
      logger.error("Error getting cart items from Redis:", error);
      return null;
    }
  }

  static async updateCartItemQuantity(
    cartId: string,
    productId: string,
    quantity: number
  ) {
    try {
      const items = await this.getCartItems(cartId);
      if (items) {
        const updatedItems = items.map((item: any) =>
          item.productId === productId ? { ...item, quantity } : item
        );
        await this.setCartItems(cartId, updatedItems);
      }
    } catch (error) {
      logger.error("Error updating cart item quantity in Redis:", error);
    }
  }
}
