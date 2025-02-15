import { Router } from "express";
import { CartController } from "../controllers/cart.controller";

const router = Router();

// Cart routes
router.post("/", CartController.createCart);
router.get("/:cartId", CartController.getCart);
router.delete("/:cartId", CartController.deleteCart);

// Cart items routes
router.post("/:cartId/items", CartController.addItemToCart);
router.get("/:cartId/items", CartController.getCartItems);
router.put("/:cartId/items/:productId", CartController.updateCartItemQuantity);
router.delete("/:cartId/items/:productId", CartController.removeCartItem);

export default router;