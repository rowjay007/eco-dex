import { Request, Response } from "express";
import * as CartService from "../services/cart.service";
import { catchAsync } from "../utils/catchAsync";

export const createCart = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.body;
  const cart = await CartService.createCart(userId);
  res.status(201).json(cart);
});

export const getCart = catchAsync(async (req: Request, res: Response) => {
  const { cartId } = req.params;
  const cart = await CartService.getCart(cartId);
  if (!cart) {
    return res.status(404).json({ error: "Cart not found" });
  }
  res.json(cart);
});

export const addItemToCart = catchAsync(async (req: Request, res: Response) => {
  const { cartId } = req.params;
  const { productId, quantity } = req.body;
  const item = await CartService.addItemToCart(cartId, productId, quantity);
  res.status(201).json(item);
});

export const getCartItems = catchAsync(async (req: Request, res: Response) => {
  const { cartId } = req.params;
  const items = await CartService.getCartItems(cartId);
  res.json(items);
});

export const updateCartItemQuantity = catchAsync(async (req: Request, res: Response) => {
  const { cartId, productId } = req.params;
  const { quantity } = req.body;
  const updatedItem = await CartService.updateCartItemQuantity(cartId, productId, quantity);
  if (!updatedItem) {
    return res.status(404).json({ error: "Cart item not found" });
  }
  res.json(updatedItem);
});

export const removeCartItem = catchAsync(async (req: Request, res: Response) => {
  const { cartId, productId } = req.params;
  await CartService.removeCartItem(cartId, productId);
  res.status(204).send();
});

export const deleteCart = catchAsync(async (req: Request, res: Response) => {
  const { cartId } = req.params;
  await CartService.deleteCart(cartId);
  res.status(204).send();
});
