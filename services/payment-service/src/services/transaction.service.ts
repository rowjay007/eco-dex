import { Pool } from 'pg';
import { Transaction } from '../types';
import { PaymentProvider, PaymentStatus, CurrencyCode } from '../config/payment.config';
import { appConfig } from '../config/app.config';

export class TransactionService {
  private readonly pool: Pool;

  constructor() {
    this.pool = new Pool({
      ...appConfig.db,
      ssl: appConfig.env === 'production' ? { rejectUnauthorized: false } : undefined
    });
  }

  async createTransaction(params: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
    const query = `
      INSERT INTO transactions (
        reference, provider_reference, provider, amount, currency, status,
        email, metadata, callback_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      params.reference,
      params.providerReference,
      params.provider,
      params.amount,
      params.currency,
      params.status,
      params.email,
      params.metadata || {},
      params.callbackUrl
    ];

    try {
      const result = await this.pool.query(query, values);
      return this.mapTransactionFromDb(result.rows[0]);
    } catch (error: any) {
      throw new Error(`Failed to create transaction: ${error.message}`);
    }
  }

  async updateTransactionStatus(
    reference: string,
    status: PaymentStatus,
    providerReference?: string
  ): Promise<Transaction> {
    const query = `
      UPDATE transactions
      SET status = $1, provider_reference = COALESCE($2, provider_reference), updated_at = NOW()
      WHERE reference = $3
      RETURNING *
    `;

    try {
      const result = await this.pool.query(query, [status, providerReference, reference]);
      if (result.rows.length === 0) {
        throw new Error(`Transaction with reference ${reference} not found`);
      }
      return this.mapTransactionFromDb(result.rows[0]);
    } catch (error: any) {
      throw new Error(`Failed to update transaction status: ${error.message}`);
    }
  }

  async getTransactionByReference(reference: string): Promise<Transaction | null> {
    const query = 'SELECT * FROM transactions WHERE reference = $1';

    try {
      const result = await this.pool.query(query, [reference]);
      return result.rows.length > 0 ? this.mapTransactionFromDb(result.rows[0]) : null;
    } catch (error: any) {
      throw new Error(`Failed to get transaction: ${error.message}`);
    }
  }

  private mapTransactionFromDb(row: any): Transaction {
    return {
      id: row.id,
      reference: row.reference,
      providerReference: row.provider_reference,
      provider: row.provider as PaymentProvider,
      amount: parseFloat(row.amount),
      currency: row.currency as CurrencyCode,
      status: row.status as PaymentStatus,
      email: row.email,
      metadata: row.metadata,
      callbackUrl: row.callback_url,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}