import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';

const router = Router();
const paymentController = new PaymentController();

// Initialize payment
router.post('/initialize', (req, res) => paymentController.initializePayment(req, res));

// Verify payment
router.get('/verify/:reference', (req, res) => paymentController.verifyPayment(req, res));

// Get supported currencies
router.get('/currencies', (req, res) => paymentController.getSupportedCurrencies(req, res));

export default router;