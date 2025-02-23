import { v4 as uuidv4 } from 'uuid';
import { PaymentGateway, PaymentInitializeParams, Transaction } from '../types';
import { TransactionService } from './transaction.service';
import { PaymentProvider, PaymentStatus, PaymentResponse, paymentConfig } from '../config/payment.config';
import { PaystackProvider } from '../providers/paystack.provider';
import { FlutterwaveProvider } from '../providers/flutterwave.provider';

export class PaymentService {
  private readonly transactionService: TransactionService;
  private readonly providers: Map<PaymentProvider, PaymentGateway>;

  constructor() {
    this.transactionService = new TransactionService();
    this.providers = new Map([
      [PaymentProvider.PAYSTACK, new PaystackProvider()],
      [PaymentProvider.FLUTTERWAVE, new FlutterwaveProvider()]
    ]);
  }

  async initializePayment(
    params: Omit<PaymentInitializeParams, 'reference'>,
    provider: PaymentProvider = paymentConfig.defaultProvider
  ): Promise<PaymentResponse> {
    try {
      const paymentProvider = this.providers.get(provider);
      if (!paymentProvider) {
        throw new Error(`Payment provider ${provider} not supported`);
      }

      const reference = uuidv4();
      const initializeResult = await paymentProvider.initialize({
        ...params,
        reference
      });

      if (!initializeResult.success) {
        return {
          success: false,
          message: 'Payment initialization failed',
          error: initializeResult.error
        };
      }

      // Create transaction record
      await this.transactionService.createTransaction({
        reference,
        providerReference: initializeResult.providerReference,
        provider,
        amount: params.amount,
        currency: params.currency,
        status: PaymentStatus.PENDING,
        email: params.email,
        metadata: params.metadata,
        callbackUrl: params.callbackUrl
      });

      return {
        success: true,
        message: 'Payment initialized successfully',
        data: {
          reference,
          authorizationUrl: initializeResult.authorizationUrl,
          accessCode: initializeResult.accessCode,
          providerReference: initializeResult.providerReference,
          status: PaymentStatus.PENDING
        }
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to initialize payment',
        error: {
          code: 'PAYMENT_INITIALIZATION_ERROR',
          message: error.message
        }
      };
    }
  }

  async verifyPayment(reference: string): Promise<PaymentResponse> {
    try {
      const transaction = await this.transactionService.getTransactionByReference(reference);
      if (!transaction) {
        throw new Error(`Transaction with reference ${reference} not found`);
      }

      const paymentProvider = this.providers.get(transaction.provider);
      if (!paymentProvider) {
        throw new Error(`Payment provider ${transaction.provider} not supported`);
      }

      const verificationResult = await paymentProvider.verify(reference);

      if (!verificationResult.success) {
        return {
          success: false,
          message: 'Payment verification failed',
          error: verificationResult.error
        };
      }

      // Update transaction status
      const updatedTransaction = await this.transactionService.updateTransactionStatus(
        reference,
        verificationResult.status,
        verificationResult.providerReference
      );

      return {
        success: true,
        message: 'Payment verified successfully',
        data: {
          reference: updatedTransaction.reference,
          providerReference: updatedTransaction.providerReference,
          status: updatedTransaction.status
        }
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to verify payment',
        error: {
          code: 'PAYMENT_VERIFICATION_ERROR',
          message: error.message
        }
      };
    }
  }

  async handleWebhook(provider: PaymentProvider, payload: any): Promise<PaymentResponse> {
    try {
      const paymentProvider = this.providers.get(provider);
      if (!paymentProvider) {
        throw new Error(`Payment provider ${provider} not supported`);
      }

      const webhookResult = await paymentProvider.handleWebhook(payload);

      if (!webhookResult.success) {
        return {
          success: false,
          message: 'Webhook processing failed',
          error: webhookResult.error
        };
      }

      // Update transaction status
      const updatedTransaction = await this.transactionService.updateTransactionStatus(
        webhookResult.reference,
        webhookResult.status,
        webhookResult.providerReference
      );

      return {
        success: true,
        message: 'Webhook processed successfully',
        data: {
          reference: updatedTransaction.reference,
          providerReference: updatedTransaction.providerReference,
          status: updatedTransaction.status
        }
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to process webhook',
        error: {
          code: 'WEBHOOK_PROCESSING_ERROR',
          message: error.message
        }
      };
    }
  }
}