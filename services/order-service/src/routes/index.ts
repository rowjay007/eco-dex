import { Router } from "express";

import { orderRoutes } from "./order.routes";
import { shipmentRoutes } from "./shipment.routes";


const router = Router();

router.use("/orders", orderRoutes);
router.use("/shipments", shipmentRoutes);

export { router as routes };
