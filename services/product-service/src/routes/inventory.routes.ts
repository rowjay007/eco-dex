import { Router } from "express";
import { inventoryController } from "../controllers/inventory.controller";

const router = Router();

router.route("/").post(inventoryController.createInventory);

router.get("/low-stock", inventoryController.checkLowStock);

router
  .route("/:productId")
  .get(inventoryController.getInventory)
  .patch(inventoryController.updateInventory);

router.post("/:productId/reserve", inventoryController.reserveStock);
router.post("/:productId/release", inventoryController.releaseStock);
router.post("/:productId/adjust", inventoryController.adjustStock);

export default router;
