import {
  createShipmentSchema,
  updateShipmentSchema,
} from "@/schemas/shipment.schema";
import { Router } from "express";
import * as shipmentController from "../controllers/shipment.controller";
import { validateRequest } from "../middleware/validate.middleware";

const router = Router();

router.get("/", shipmentController.getAllShipments);
router.get("/:id", shipmentController.getShipmentById);
router.post(
  "/",
  validateRequest(createShipmentSchema),
  shipmentController.createShipment
);
router.put(
  "/:id",
  validateRequest(updateShipmentSchema),
  shipmentController.updateShipment
);
router.delete("/:id", shipmentController.deleteShipment);

export { router as shipmentRoutes };
