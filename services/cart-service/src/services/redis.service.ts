import redis from "../config/redis.config";
import logger from "../utils/logger";

const CART_PREFIX = "cart:";
const CART_ITEMS_PREFIX = "cart_items:";
const CART_TTL = 60 * 60 * 24 * 7;

export const getCart = async (cartId: string) => {
  try {
    const cart = await redis.get(`${CART_PREFIX}${cartId}`);
    return cart ? JSON.parse(cart) : null;
  } catch (error) {
    logger.error("Error getting cart from Redis:", error);
    return null;
  }
};

export const setCart = async (cartId: string, cart: Record<string, any>) => {
  try {
    await redis.setEx(
      `${CART_PREFIX}${cartId}`,
      CART_TTL,
      JSON.stringify(cart)
    );
  } catch (error) {
    logger.error("Error setting cart in Redis:", error);
  }
};

export const setCartItems = async (
  cartId: string,
  items: Record<string, any>[]
) => {
  try {
    await redis.setEx(
      `${CART_ITEMS_PREFIX}${cartId}`,
      CART_TTL,
      JSON.stringify(items)
    );
  } catch (error) {
    logger.error("Error setting cart items in Redis:", error);
  }
};

export const deleteCart = async (cartId: string) => {
  try {
    await Promise.all([
      redis.del(`${CART_PREFIX}${cartId}`),
      redis.del(`${CART_ITEMS_PREFIX}${cartId}`),
    ]);
  } catch (error) {
    logger.error("Error deleting cart from Redis:", error);
  }
};

export const getCartItems = async (cartId: string) => {
  try {
    const items = await redis.get(`${CART_ITEMS_PREFIX}${cartId}`);
    return items ? JSON.parse(items) : null;
  } catch (error) {
    logger.error("Error getting cart items from Redis:", error);
    return null;
  }
};

export const updateCartItemQuantity = async (
  cartId: string,
  productId: string,
  quantity: number
) => {
  try {
    const items = await getCartItems(cartId);
    if (items) {
      const updatedItems = items.map((item: any) =>
        item.productId === productId ? { ...item, quantity } : item
      );
      await setCartItems(cartId, updatedItems);
    }
  } catch (error) {
    logger.error("Error updating cart item quantity in Redis:", error);
  }
};
