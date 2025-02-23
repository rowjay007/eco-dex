import axios from 'axios';
import { PaymentGateway, PaymentInitializeParams, PaymentInitializeResult, PaymentVerificationResult, WebhookResult } from '../types';
import { PaymentProvider, PaymentStatus, CurrencyCode } from '../config/payment.config';
import { appConfig } from '../config/app.config';

export class PaystackProvider implements PaymentGateway {
  private readonly secretKey: string;
  private readonly baseUrl = 'https://api.paystack.co';

  constructor() {
    this.secretKey = appConfig.paystack.secretKey;
  }

  private getHeaders() {
    return {
      Authorization: `Bearer ${this.secretKey}`,
      'Content-Type': 'application/json'
    };
  }

  async initialize(params: PaymentInitializeParams): Promise<PaymentInitializeResult> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/transaction/initialize`,
        {
          amount: params.amount * 100, // Convert to kobo/cents
          email: params.email,
          currency: params.currency,
          reference: params.reference,
          callback_url: params.callbackUrl,
          metadata: {
            ...params.metadata,
            provider: PaymentProvider.PAYSTACK
          }
        },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        reference: params.reference,
        authorizationUrl: response.data.data.authorization_url,
        accessCode: response.data.data.access_code,
        providerReference: response.data.data.reference
      };
    } catch (error: any) {
      return {
        success: false,
        reference: params.reference,
        error: {
          code: 'PAYSTACK_INITIALIZATION_ERROR',
          message: error.response?.data?.message || 'Failed to initialize payment'
        }
      };
    }
  }

  async verify(reference: string): Promise<PaymentVerificationResult> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/transaction/verify/${reference}`,
        { headers: this.getHeaders() }
      );

      const { data } = response.data;
      const status = this.mapPaystackStatus(data.status);

      return {
        success: true,
        reference,
        providerReference: data.reference,
        status,
        amount: data.amount / 100, // Convert from kobo/cents
        currency: data.currency as CurrencyCode,
        metadata: data.metadata
      };
    } catch (error: any) {
      return {
        success: false,
        reference,
        status: PaymentStatus.FAILED,
        amount: 0,
        currency: CurrencyCode.NGN,
        error: {
          code: 'PAYSTACK_VERIFICATION_ERROR',
          message: error.response?.data?.message || 'Failed to verify payment'
        }
      };
    }
  }

  async handleWebhook(payload: any): Promise<WebhookResult> {
    try {
      const event = payload.event;
      const data = payload.data;
      const reference = data.reference;
      const status = this.mapPaystackStatus(data.status);

      return {
        success: true,
        reference,
        providerReference: data.reference,
        status
      };
    } catch (error: any) {
      return {
        success: false,
        reference: payload?.data?.reference || 'UNKNOWN',
        status: PaymentStatus.FAILED,
        error: {
          code: 'PAYSTACK_WEBHOOK_ERROR',
          message: 'Failed to process webhook payload'
        }
      };
    }
  }

  private mapPaystackStatus(paystackStatus: string): PaymentStatus {
    switch (paystackStatus.toLowerCase()) {
      case 'success':
        return PaymentStatus.SUCCESS;
      case 'failed':
        return PaymentStatus.FAILED;
      case 'abandoned':
        return PaymentStatus.CANCELLED;
      default:
        return PaymentStatus.PENDING;
    }
  }
}