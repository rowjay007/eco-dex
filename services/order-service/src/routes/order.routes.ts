import { Router } from "express";
import * as orderController from "../controllers/order.controller";
import { validateRequest } from "../middleware/validate.middleware";
import { createOrderSchema, updateOrderSchema } from "../schemas/order.schema";

const router = Router();

router.get("/", orderController.getAllOrders);
router.get("/:id", orderController.getOrderById);
router.post(
  "/",
  validateRequest(createOrderSchema),
  orderController.createOrder
);
router.put(
  "/:id",
  validateRequest(updateOrderSchema),
  orderController.updateOrder
);
router.delete("/:id", orderController.deleteOrder);

export { router as orderRoutes };
