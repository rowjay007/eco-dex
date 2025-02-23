import { z } from 'zod';

// Payment provider types
export enum PaymentProvider {
  PAYSTACK = 'paystack',
  FLUTTERWAVE = 'flutterwave'
}

// Currency codes supported by the payment service
export enum CurrencyCode {
  NGN = 'NGN',
  USD = 'USD',
  GHS = 'GHS',
  KES = 'KES',
  ZAR = 'ZAR'
}

// Payment status types
export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

// Base payment request schema
export const PaymentRequestSchema = z.object({
  amount: z.number().positive(),
  currency: z.nativeEnum(CurrencyCode),
  email: z.string().email(),
  reference: z.string(),
  callbackUrl: z.string().url(),
  metadata: z.record(z.any()).optional()
});

// Payment response interface
export interface PaymentResponse {
  success: boolean;
  message: string;
  data?: {
    reference: string;
    authorizationUrl?: string;
    accessCode?: string;
    providerReference?: string;
    status: PaymentStatus;
  };
  error?: {
    code: string;
    message: string;
  };
}

// Payment provider configuration
export interface PaymentProviderConfig {
  name: PaymentProvider;
  isActive: boolean;
  credentials: {
    secretKey: string;
    publicKey: string;
  };
  webhookEndpoint: string;
}

// Payment service configuration
export const paymentConfig = {
  providers: {
    [PaymentProvider.PAYSTACK]: {
      name: PaymentProvider.PAYSTACK,
      isActive: true,
      credentials: {
        secretKey: process.env.PAYSTACK_SECRET_KEY || '',
        publicKey: process.env.PAYSTACK_PUBLIC_KEY || ''
      },
      webhookEndpoint: '/webhooks/paystack'
    },
    [PaymentProvider.FLUTTERWAVE]: {
      name: PaymentProvider.FLUTTERWAVE,
      isActive: true,
      credentials: {
        secretKey: process.env.FLUTTERWAVE_SECRET_KEY || '',
        publicKey: process.env.FLUTTERWAVE_PUBLIC_KEY || ''
      },
      webhookEndpoint: '/webhooks/flutterwave'
    }
  },
  defaultProvider: PaymentProvider.PAYSTACK,
  webhookTimeout: 30000, // 30 seconds
  retryAttempts: 3,
  minimumAmount: 100, // in lowest currency unit
  maximumAmount: 10000000 // in lowest currency unit
};