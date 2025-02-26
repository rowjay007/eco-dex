import { Router } from "express";
import {
  initiateFlutterwavePayment,
  initiatePaystackPayment,
  verifyFlutterwavePayment,
  verifyPaystackPayment,
} from "../controllers/payment.controller";

const router = Router();

router.post("/paystack/initiate", initiatePaystackPayment);
router.post("/paystack/verify", verifyPaystackPayment);

router.post("/flutterwave/initiate", initiateFlutterwavePayment);
router.post("/flutterwave/verify", verifyFlutterwavePayment);

export default router;
