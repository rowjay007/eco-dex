import { PaystackProvider } from '../providers/paystack.provider';
import { FlutterwaveProvider } from '../providers/flutterwave.provider';
import { redis } from '../config/redis.config';
import { producer, PAYMENT_TOPICS } from '../config/kafka.config';
import { logger } from '../config/logger.config';

export type PaymentProvider = 'paystack' | 'flutterwave';

export interface InitiatePaymentParams {
  amount: number;
  email: string;
  provider: PaymentProvider;
  currency?: string;
  reference?: string;
  callbackUrl?: string;
  metadata?: Record<string, any>;
}

export class PaymentService {
  private readonly paystackProvider: PaystackProvider;
  private readonly flutterwaveProvider: FlutterwaveProvider;

  constructor() {
    this.paystackProvider = new PaystackProvider();
    this.flutterwaveProvider = new FlutterwaveProvider();
  }

  async initiatePayment(params: InitiatePaymentParams) {
    logger.info({ params }, 'Initiating payment');
    try {
      const { provider, ...paymentParams } = params;
      let result;

      if (provider === 'paystack') {
        result = await this.paystackProvider.initializeTransaction({
          email: paymentParams.email,
          amount: paymentParams.amount,
          reference: paymentParams.reference,
          callbackUrl: paymentParams.callbackUrl,
        });
      } else {
        result = await this.flutterwaveProvider.initializePayment({
          tx_ref: paymentParams.reference || String(Date.now()),
          amount: paymentParams.amount,
          currency: paymentParams.currency || 'NGN',
          redirect_url: paymentParams.callbackUrl || '',
          customer: {
            email: paymentParams.email,
          },
          meta: paymentParams.metadata,
        });
      }

      const paymentReference = result.data.reference || result.data.tx_ref;
      logger.info({ paymentReference }, 'Payment initialized successfully');

      await redis.set(
        `payment:${paymentReference}`,
        JSON.stringify({
          ...paymentParams,
          provider,
          status: 'pending',
          createdAt: new Date().toISOString(),
        }),
        { ex: 24 * 60 * 60 } 
      );
      logger.debug({ paymentReference }, 'Payment details cached');

      await producer.send({
        topic: PAYMENT_TOPICS.PAYMENT_CREATED,
        messages: [{
          key: paymentReference,
          value: JSON.stringify({
            ...paymentParams,
            provider,
            status: 'pending',
          }),
        }],
      });
      logger.debug({ paymentReference }, 'Payment created event emitted');

      return result;
    } catch (error) {
      logger.error({ error, params }, 'Failed to initiate payment');
      throw error;
    }
  }

  async verifyPayment(reference: string, provider: PaymentProvider) {
    logger.info({ reference, provider }, 'Verifying payment');
    try {
      let verificationResult;

      if (provider === 'paystack') {
        verificationResult = await this.paystackProvider.verifyTransaction(reference);
      } else {
        verificationResult = await this.flutterwaveProvider.verifyTransaction(reference);
      }

      const status = this.normalizeTransactionStatus(verificationResult, provider);
      logger.info({ reference, status }, 'Payment verification status determined');

      const topic = status === 'success' 
        ? PAYMENT_TOPICS.PAYMENT_COMPLETED 
        : PAYMENT_TOPICS.PAYMENT_FAILED;

      await redis.set(
        `payment:${reference}`,
        JSON.stringify({
          ...verificationResult.data,
          status,
          updatedAt: new Date().toISOString(),
        }),
        { ex: 24 * 60 * 60 }
      );
      logger.debug({ reference }, 'Payment cache updated');

      await producer.send({
        topic,
        messages: [{
          key: reference,
          value: JSON.stringify({
            reference,
            provider,
            status,
            data: verificationResult.data,
          }),
        }],
      });
      logger.debug({ reference, topic }, 'Payment status event emitted');

      return verificationResult;
    } catch (error) {
      logger.error({ error, reference, provider }, 'Failed to verify payment');
      throw error;
    }
  }

  private normalizeTransactionStatus(
    result: any,
    provider: PaymentProvider
  ): 'success' | 'failed' | 'pending' {
    if (provider === 'paystack') {
      return result.data.status === 'success' ? 'success' : 'failed';
    } else {
      return result.data.status === 'successful' ? 'success' : 'failed';
    }
  }
}
