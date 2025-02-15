import { Request, Response } from "express";
import { CartService } from "../services/cart.service";
import logger from "../utils/logger";

export class CartController {
  static async createCart(req: Request, res: Response) {
    try {
      const { userId } = req.body;
      const cart = await CartService.createCart(userId);
      res.status(201).json(cart);
    } catch (error) {
      logger.error("Error in createCart controller:", error);
      res.status(500).json({ error: "Failed to create cart" });
    }
  }

  static async getCart(req: Request, res: Response) {
    try {
      const { cartId } = req.params;
      const cart = await CartService.getCart(cartId);
      if (!cart) {
        return res.status(404).json({ error: "Cart not found" });
      }
      res.json(cart);
    } catch (error) {
      logger.error("Error in getCart controller:", error);
      res.status(500).json({ error: "Failed to get cart" });
    }
  }

  static async addItemToCart(req: Request, res: Response) {
    try {
      const { cartId } = req.params;
      const { productId, quantity } = req.body;
      const item = await CartService.addItemToCart(cartId, productId, quantity);
      res.status(201).json(item);
    } catch (error) {
      logger.error("Error in addItemToCart controller:", error);
      res.status(500).json({ error: "Failed to add item to cart" });
    }
  }

  static async getCartItems(req: Request, res: Response) {
    try {
      const { cartId } = req.params;
      const items = await CartService.getCartItems(cartId);
      res.json(items);
    } catch (error) {
      logger.error("Error in getCartItems controller:", error);
      res.status(500).json({ error: "Failed to get cart items" });
    }
  }

  static async updateCartItemQuantity(req: Request, res: Response) {
    try {
      const { cartId, productId } = req.params;
      const { quantity } = req.body;
      const updatedItem = await CartService.updateCartItemQuantity(
        cartId,
        productId,
        quantity
      );
      if (!updatedItem) {
        return res.status(404).json({ error: "Cart item not found" });
      }
      res.json(updatedItem);
    } catch (error) {
      logger.error("Error in updateCartItemQuantity controller:", error);
      res.status(500).json({ error: "Failed to update cart item quantity" });
    }
  }

  static async removeCartItem(req: Request, res: Response) {
    try {
      const { cartId, productId } = req.params;
      await CartService.removeCartItem(cartId, productId);
      res.status(204).send();
    } catch (error) {
      logger.error("Error in removeCartItem controller:", error);
      res.status(500).json({ error: "Failed to remove cart item" });
    }
  }

  static async deleteCart(req: Request, res: Response) {
    try {
      const { cartId } = req.params;
      await CartService.deleteCart(cartId);
      res.status(204).send();
    } catch (error) {
      logger.error("Error in deleteCart controller:", error);
      res.status(500).json({ error: "Failed to delete cart" });
    }
  }
}