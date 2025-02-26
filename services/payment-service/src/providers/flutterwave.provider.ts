import axios from "axios";
import { config } from "../config/app.config";
import { logger } from "../config/logger.config";

const FLUTTERWAVE_BASE_URL = "https://api.flutterwave.com/v3";

export class FlutterwaveProvider {
  private readonly secretKey: string;
  private readonly publicKey: string;

  constructor() {
    this.secretKey = config.FLUTTERWAVE_SECRET_KEY;
    this.publicKey = config.FLUTTERWAVE_PUBLIC_KEY;
  }

  private get headers() {
    return {
      Authorization: `Bearer ${this.secretKey}`,
      "Content-Type": "application/json",
    };
  }

  async initializePayment(params: {
    tx_ref: string;
    amount: number;
    currency: string;
    redirect_url: string;
    customer: {
      email: string;
      name?: string;
      phonenumber?: string;
    };
    meta?: Record<string, any>;
  }) {
    logger.info({ params }, "Initializing Flutterwave payment");
    try {
      const response = await axios.post(
        `${FLUTTERWAVE_BASE_URL}/payments`,
        params,
        { headers: this.headers }
      );
      logger.info(
        { tx_ref: params.tx_ref },
        "Flutterwave payment initialized successfully"
      );
      return response.data;
    } catch (error) {
      logger.error(
        { error, params },
        "Failed to initialize Flutterwave payment"
      );
      throw this.handleError(error);
    }
  }

  async verifyTransaction(transactionId: string) {
    logger.info({ transactionId }, "Verifying Flutterwave transaction");
    try {
      const response = await axios.get(
        `${FLUTTERWAVE_BASE_URL}/transactions/${transactionId}/verify`,
        { headers: this.headers }
      );
      logger.info(
        { transactionId, status: response.data.status },
        "Flutterwave transaction verified"
      );
      return response.data;
    } catch (error) {
      logger.error(
        { error, transactionId },
        "Failed to verify Flutterwave transaction"
      );
      throw this.handleError(error);
    }
  }

  async initiateRefund(params: { transaction_id: string; amount?: number }) {
    logger.info({ params }, "Initiating Flutterwave refund");
    try {
      const response = await axios.post(
        `${FLUTTERWAVE_BASE_URL}/transactions/${params.transaction_id}/refund`,
        { amount: params.amount },
        { headers: this.headers }
      );
      logger.info(
        { transactionId: params.transaction_id },
        "Flutterwave refund initiated successfully"
      );
      return response.data;
    } catch (error) {
      logger.error({ error, params }, "Failed to initiate Flutterwave refund");
      throw this.handleError(error);
    }
  }

  private handleError(error: any) {
    if (axios.isAxiosError(error)) {
      return new Error(
        error.response?.data?.message || "An error occurred with Flutterwave"
      );
    }
    return error;
  }
}
