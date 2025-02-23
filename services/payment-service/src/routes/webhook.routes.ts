import { Router } from 'express';
import { WebhookController } from '../controllers/webhook.controller';

const router = Router();
const webhookController = new WebhookController();

// Paystack webhook endpoint
router.post('/paystack', (req, res) => webhookController.handlePaystackWebhook(req, res));

// Flutterwave webhook endpoint
router.post('/flutterwave', (req, res) => webhookController.handleFlutterwaveWebhook(req, res));

export default router;