import { Router } from "express";
import categoryRoutes from "./category.routes";
import inventoryRoutes from "./inventory.routes";
import productRoutes from "./product.routes";

const router = Router();

router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/inventory", inventoryRoutes);

export default router;
