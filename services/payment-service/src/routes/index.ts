import { Router } from "express";
import paymentRoutes from "./payment.routes";

const router = Router();

const v1Router = Router();
v1Router.use("/payments", paymentRoutes);

router.use("/v1", v1Router);

export default router;