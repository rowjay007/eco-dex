import { Router } from "express";
import cartRoutes from "./cart.routes";

const router = Router();

router.use("/carts", cartRoutes);

export default router;