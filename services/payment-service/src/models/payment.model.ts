import { pgTable, uuid, varchar, timestamp, numeric, jsonb, boolean } from 'drizzle-orm/pg-core';

export const paymentMethods = pgTable('payment_methods', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(),
  type: varchar('type', { length: 50 }).notNull(), 
  provider: varchar('provider', { length: 50 }).notNull(),
  details: jsonb('details').notNull(), 
  isDefault: boolean('is_default').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const transactions = pgTable('transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(),
  orderId: uuid('order_id').notNull(),
  paymentMethodId: uuid('payment_method_id').references(() => paymentMethods.id),
  amount: numeric('amount').notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('NGN'),
  status: varchar('status', { length: 20 }).notNull(), 
  provider: varchar('provider', { length: 50 }).notNull(),
  providerTransactionId: varchar('provider_transaction_id', { length: 255 }),
  providerReference: varchar('provider_reference', { length: 255 }),
  metadata: jsonb('metadata'),
  errorDetails: jsonb('error_details'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const refunds = pgTable('refunds', {
  id: uuid('id').defaultRandom().primaryKey(),
  transactionId: uuid('transaction_id').references(() => transactions.id),
  amount: numeric('amount').notNull(),
  reason: varchar('reason', { length: 255 }).notNull(),
  status: varchar('status', { length: 20 }).notNull(), // 'pending', 'completed', 'failed'
  providerRefundId: varchar('provider_refund_id', { length: 255 }),
  metadata: jsonb('metadata'),
  errorDetails: jsonb('error_details'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});


export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];


export const PAYMENT_PROVIDER = {
  PAYSTACK: 'paystack',
  FLUTTERWAVE: 'flutterwave',
} as const;

export type PaymentProvider = typeof PAYMENT_PROVIDER[keyof typeof PAYMENT_PROVIDER];


export const PAYMENT_METHOD_TYPE = {
  CARD: 'card',
  BANK_TRANSFER: 'bank_transfer',
  USSD: 'ussd',
  QR: 'qr',
} as const;

export type PaymentMethodType = typeof PAYMENT_METHOD_TYPE[keyof typeof PAYMENT_METHOD_TYPE];
