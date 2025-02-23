import { Request, Response } from 'express';
import { PaymentService } from '../services/payment.service';
import { PaymentProvider } from '../config/payment.config';
import { appConfig } from '../config/app.config';

export class WebhookController {
  private readonly paymentService: PaymentService;

  constructor() {
    this.paymentService = new PaymentService();
  }

  async handlePaystackWebhook(req: Request, res: Response) {
    try {
      // Verify webhook signature
      const hash = crypto.createHmac('sha512', appConfig.webhook.secret)
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (hash !== req.headers['x-paystack-signature']) {
        return res.status(401).json({
          success: false,
          message: 'Invalid webhook signature',
          error: {
            code: 'INVALID_SIGNATURE',
            message: 'Could not verify webhook signature'
          }
        });
      }

      const result = await this.paymentService.handleWebhook(
        PaymentProvider.PAYSTACK,
        req.body
      );

      return res.status(result.success ? 200 : 400).json(result);
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Failed to process Paystack webhook',
        error: {
          code: 'WEBHOOK_PROCESSING_ERROR',
          message: error.message
        }
      });
    }
  }

  async handleFlutterwaveWebhook(req: Request, res: Response) {
    try {
      // Verify webhook signature
      const secretHash = req.headers['verif-hash'];
      if (!secretHash || secretHash !== appConfig.webhook.secret) {
        return res.status(401).json({
          success: false,
          message: 'Invalid webhook signature',
          error: {
            code: 'INVALID_SIGNATURE',
            message: 'Could not verify webhook signature'
          }
        });
      }

      const result = await this.paymentService.handleWebhook(
        PaymentProvider.FLUTTERWAVE,
        req.body
      );

      return res.status(result.success ? 200 : 400).json(result);
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Failed to process Flutterwave webhook',
        error: {
          code: 'WEBHOOK_PROCESSING_ERROR',
          message: error.message
        }
      });
    }
  }
}