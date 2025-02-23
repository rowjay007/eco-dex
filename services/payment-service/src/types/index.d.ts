import { PaymentProvider, CurrencyCode, PaymentStatus } from '../config/payment.config';

export interface Transaction {
  id: string;
  reference: string;
  providerReference?: string;
  provider: PaymentProvider;
  amount: number;
  currency: CurrencyCode;
  status: PaymentStatus;
  email: string;
  metadata?: Record<string, any>;
  callbackUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentGateway {
  initialize(params: PaymentInitializeParams): Promise<PaymentInitializeResult>;
  verify(reference: string): Promise<PaymentVerificationResult>;
  handleWebhook(payload: any): Promise<WebhookResult>;
}

export interface PaymentInitializeParams {
  amount: number;
  currency: CurrencyCode;
  email: string;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, any>;
}

export interface PaymentInitializeResult {
  success: boolean;
  reference: string;
  authorizationUrl?: string;
  accessCode?: string;
  providerReference?: string;
  error?: {
    code: string;
    message: string;
  };
}

export interface PaymentVerificationResult {
  success: boolean;
  reference: string;
  providerReference?: string;
  status: PaymentStatus;
  amount: number;
  currency: CurrencyCode;
  metadata?: Record<string, any>;
  error?: {
    code: string;
    message: string;
  };
}

export interface WebhookResult {
  success: boolean;
  reference: string;
  providerReference?: string;
  status: PaymentStatus;
  error?: {
    code: string;
    message: string;
  };
}

export interface PaymentServiceError extends Error {
  code: string;
  statusCode?: number;
  details?: Record<string, any>;
}