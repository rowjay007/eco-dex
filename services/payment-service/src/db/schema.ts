import { pgTable, serial, varchar, timestamp, numeric, jsonb } from 'drizzle-orm/pg-core';

export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  transactionId: varchar('transaction_id', { length: 255 }).notNull().unique(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('NGN'),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  paymentMethod: varchar('payment_method', { length: 50 }).notNull(),
  provider: varchar('provider', { length: 50 }).notNull(), // 'paystack' or 'flutterwave'
  metadata: jsonb('metadata'),
  customerEmail: varchar('customer_email', { length: 255 }).notNull(),
  customerName: varchar('customer_name', { length: 255 }),
  description: varchar('description', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
