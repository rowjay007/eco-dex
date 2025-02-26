import axios from 'axios';
import { config } from '../config/app.config';
import { logger } from '../config/logger.config';

const PAYSTACK_BASE_URL = 'https://api.paystack.co';

export class PaystackProvider {
  private readonly secretKey: string;
  private readonly publicKey: string;

  constructor() {
    this.secretKey = config.PAYSTACK_SECRET_KEY;
    this.publicKey = config.PAYSTACK_PUBLIC_KEY;
  }

  private get headers() {
    return {
      Authorization: `Bearer ${this.secretKey}`,
      'Content-Type': 'application/json',
    };
  }

  async initializeTransaction(params: {
    email: string;
    amount: number;
    reference?: string;
    callbackUrl?: string;
  }) {
    logger.info({ params }, 'Initializing Paystack transaction');
    try {
      const response = await axios.post(
        `${PAYSTACK_BASE_URL}/transaction/initialize`,
        {
          ...params,
          amount: params.amount * 100, 
        },
        { headers: this.headers }
      );
      logger.info({ reference: response.data.data.reference }, 'Paystack transaction initialized successfully');
      return response.data;
    } catch (error) {
      logger.error({ error, params }, 'Failed to initialize Paystack transaction');
      throw this.handleError(error);
    }
  }

  async verifyTransaction(reference: string) {
    logger.info({ reference }, 'Verifying Paystack transaction');
    try {
      const response = await axios.get(
        `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
        { headers: this.headers }
      );
      logger.info({ reference, status: response.data.data.status }, 'Paystack transaction verified');
      return response.data;
    } catch (error) {
      logger.error({ error, reference }, 'Failed to verify Paystack transaction');
      throw this.handleError(error);
    }
  }

  async refundTransaction(params: {
    transaction: string;
    amount?: number;
  }) {
    logger.info({ params }, 'Initiating Paystack refund');
    try {
      const response = await axios.post(
        `${PAYSTACK_BASE_URL}/refund`,
        params,
        { headers: this.headers }
      );
      logger.info({ transactionId: params.transaction }, 'Paystack refund initiated successfully');
      return response.data;
    } catch (error) {
      logger.error({ error, params }, 'Failed to initiate Paystack refund');
      throw this.handleError(error);
    }
  }

  private handleError(error: any) {
    if (axios.isAxiosError(error)) {
      return new Error(
        error.response?.data?.message || 'An error occurred with Paystack'
      );
    }
    return error;
  }
}
