import { Request, Response } from 'express';
import { PaymentService } from '../services/payment.service';
import { PaymentProvider, PaymentRequestSchema, CurrencyCode } from '../config/payment.config';

export class PaymentController {
  private readonly paymentService: PaymentService;

  constructor() {
    this.paymentService = new PaymentService();
  }

  async initializePayment(req: Request, res: Response) {
    try {
      const validationResult = PaymentRequestSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid request data',
          error: {
            code: 'VALIDATION_ERROR',
            message: validationResult.error.message
          }
        });
      }

      const provider = req.body.provider as PaymentProvider || undefined;
      const result = await this.paymentService.initializePayment(
        {
          amount: validationResult.data.amount,
          currency: validationResult.data.currency,
          email: validationResult.data.email,
          callbackUrl: validationResult.data.callbackUrl,
          metadata: validationResult.data.metadata
        },
        provider
      );

      return res.status(result.success ? 200 : 400).json(result);
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message
        }
      });
    }
  }

  async verifyPayment(req: Request, res: Response) {
    try {
      const { reference } = req.params;
      if (!reference) {
        return res.status(400).json({
          success: false,
          message: 'Payment reference is required',
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Payment reference is required'
          }
        });
      }

      const result = await this.paymentService.verifyPayment(reference);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message
        }
      });
    }
  }

  async getSupportedCurrencies(_req: Request, res: Response) {
    try {
      const currencies = Object.values(CurrencyCode);
      return res.status(200).json({
        success: true,
        message: 'Supported currencies retrieved successfully',
        data: {
          currencies
        }
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message
        }
      });
    }
  }
}