import axios from 'axios';
import { PaymentGateway, PaymentInitializeParams, PaymentInitializeResult, PaymentVerificationResult, WebhookResult } from '../types';
import { PaymentProvider, PaymentStatus, CurrencyCode } from '../config/payment.config';
import { appConfig } from '../config/app.config';

export class FlutterwaveProvider implements PaymentGateway {
  private readonly secretKey: string;
  private readonly baseUrl = 'https://api.flutterwave.com/v3';

  constructor() {
    this.secretKey = appConfig.flutterwave.secretKey;
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
        `${this.baseUrl}/payments`,
        {
          tx_ref: params.reference,
          amount: params.amount,
          currency: params.currency,
          redirect_url: params.callbackUrl,
          customer: {
            email: params.email
          },
          meta: {
            ...params.metadata,
            provider: PaymentProvider.FLUTTERWAVE
          },
          payment_options: 'card,banktransfer,ussd'
        },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        reference: params.reference,
        authorizationUrl: response.data.data.link,
        providerReference: response.data.data.id.toString()
      };
    } catch (error: any) {
      return {
        success: false,
        reference: params.reference,
        error: {
          code: 'FLUTTERWAVE_INITIALIZATION_ERROR',
          message: error.response?.data?.message || 'Failed to initialize payment'
        }
      };
    }
  }

  async verify(reference: string): Promise<PaymentVerificationResult> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/transactions/verify_by_reference?tx_ref=${reference}`,
        { headers: this.getHeaders() }
      );

      const { data } = response.data;
      const status = this.mapFlutterwaveStatus(data.status);

      return {
        success: true,
        reference,
        providerReference: data.id.toString(),
        status,
        amount: data.amount,
        currency: data.currency as CurrencyCode,
        metadata: data.meta
      };
    } catch (error: any) {
      return {
        success: false,
        reference,
        status: PaymentStatus.FAILED,
        amount: 0,
        currency: CurrencyCode.NGN,
        error: {
          code: 'FLUTTERWAVE_VERIFICATION_ERROR',
          message: error.response?.data?.message || 'Failed to verify payment'
        }
      };
    }
  }

  async handleWebhook(payload: any): Promise<WebhookResult> {
    try {
      const data = payload.data;
      const reference = data.tx_ref;
      const status = this.mapFlutterwaveStatus(data.status);

      return {
        success: true,
        reference,
        providerReference: data.id.toString(),
        status
      };
    } catch (error: any) {
      return {
        success: false,
        reference: payload?.data?.tx_ref || 'UNKNOWN',
        status: PaymentStatus.FAILED,
        error: {
          code: 'FLUTTERWAVE_WEBHOOK_ERROR',
          message: 'Failed to process webhook payload'
        }
      };
    }
  }

  private mapFlutterwaveStatus(flwStatus: string): PaymentStatus {
    switch (flwStatus.toLowerCase()) {
      case 'successful':
        return PaymentStatus.SUCCESS;
      case 'failed':
        return PaymentStatus.FAILED;
      case 'cancelled':
        return PaymentStatus.CANCELLED;
      default:
        return PaymentStatus.PENDING;
    }
  }
}