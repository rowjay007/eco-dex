import "express";
import type { Request, Response } from "express";
import { z } from "zod";
import { logger } from "../config/logger.config";
import { PaymentService } from "../services/payment.service";

const paymentService = new PaymentService();

const initiatePaymentBaseSchema = {
  amount: z.number().positive(),
  email: z.string().email(),
  currency: z.string().optional(),
  reference: z.string().optional(),
  callbackUrl: z.string().url().optional(),
  metadata: z.record(z.any()).optional(),
};

const initiatePaystackSchema = z.object(initiatePaymentBaseSchema);
const initiateFlutterwaveSchema = z.object(initiatePaymentBaseSchema);

const verifyPaystackSchema = z.object({
  reference: z.string(),
});

const verifyFlutterwaveSchema = z.object({
  reference: z.string(),
});

const handleZodError = (error: z.ZodError, requestId: any, context: string) => {
  logger.warn({ requestId, errors: error.errors }, `Invalid ${context} data`);
  return {
    status: 400,
    body: {
      status: "error",
      message: "Invalid request data",
      errors: error.errors,
    },
  };
};

const handleGenericError = (
  error: unknown,
  requestId: any,
  context: string
) => {
  logger.error({ requestId, error }, `${context} failed`);
  return {
    status: 500,
    body: {
      status: "error",
      message: error instanceof Error ? error.message : "An error occurred",
    },
  };
};

export const initiatePaystackPayment = async (
  req: Request,
  res: Response
): Promise<void> => {
  const requestId = req.id;
  logger.info(
    { requestId, body: req.body },
    "Paystack payment initiation request received"
  );

  try {
    const validatedData = initiatePaystackSchema.parse(req.body);
    logger.debug(
      { requestId, validatedData },
      "Paystack payment request data validated"
    );

    const result = await paymentService.initiatePayment({
      ...validatedData,
      provider: "paystack",
    });
    logger.info(
      {
        requestId,
        paymentReference: result.data.reference,
      },
      "Paystack payment initiated successfully"
    );

    res.status(200).json({
      status: "success",
      message: "Payment initiated successfully",
      data: result.data,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorResponse = handleZodError(
        error,
        requestId,
        "Paystack payment request"
      );
      res.status(errorResponse.status).json(errorResponse.body);
      return;
    }

    const errorResponse = handleGenericError(
      error,
      requestId,
      "Paystack payment initiation"
    );
    res.status(errorResponse.status).json(errorResponse.body);
    return;
  }
};

export const initiateFlutterwavePayment = async (
  req: Request,
  res: Response
): Promise<void> => {
  const requestId = req.id;
  logger.info(
    { requestId, body: req.body },
    "Flutterwave payment initiation request received"
  );

  try {
    const validatedData = initiateFlutterwaveSchema.parse(req.body);
    logger.debug(
      { requestId, validatedData },
      "Flutterwave payment request data validated"
    );

    const result = await paymentService.initiatePayment({
      ...validatedData,
      provider: "flutterwave",
    });
    logger.info(
      {
        requestId,
        paymentReference: result.data.tx_ref,
      },
      "Flutterwave payment initiated successfully"
    );

    res.status(200).json({
      status: "success",
      message: "Payment initiated successfully",
      data: result.data,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorResponse = handleZodError(
        error,
        requestId,
        "Flutterwave payment request"
      );
      res.status(errorResponse.status).json(errorResponse.body);
      return;
    }

    const errorResponse = handleGenericError(
      error,
      requestId,
      "Flutterwave payment initiation"
    );
    res.status(errorResponse.status).json(errorResponse.body);
    return;
  }
};

export const verifyPaystackPayment = async (
  req: Request,
  res: Response
): Promise<void> => {
  const requestId = req.id;
  logger.info(
    { requestId, body: req.body },
    "Paystack payment verification request received"
  );

  try {
    const validatedData = verifyPaystackSchema.parse(req.body);
    logger.debug(
      { requestId, validatedData },
      "Paystack payment verification data validated"
    );

    const result = await paymentService.verifyPayment(
      validatedData.reference,
      "paystack"
    );
    logger.info(
      {
        requestId,
        reference: validatedData.reference,
        status: result.data.status,
      },
      "Paystack payment verified successfully"
    );

    res.status(200).json({
      status: "success",
      message: "Payment verified successfully",
      data: result.data,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorResponse = handleZodError(
        error,
        requestId,
        "Paystack payment verification"
      );
      res.status(errorResponse.status).json(errorResponse.body);
      return;
    }

    const errorResponse = handleGenericError(
      error,
      requestId,
      "Paystack payment verification"
    );
    res.status(errorResponse.status).json(errorResponse.body);
    return;
  }
};

export const verifyFlutterwavePayment = async (
  req: Request,
  res: Response
): Promise<void> => {
  const requestId = req.id;
  logger.info(
    { requestId, body: req.body },
    "Flutterwave payment verification request received"
  );

  try {
    const validatedData = verifyFlutterwaveSchema.parse(req.body);
    logger.debug(
      { requestId, validatedData },
      "Flutterwave payment verification data validated"
    );

    const result = await paymentService.verifyPayment(
      validatedData.reference,
      "flutterwave"
    );
    logger.info(
      {
        requestId,
        reference: validatedData.reference,
        status: result.data.status,
      },
      "Flutterwave payment verified successfully"
    );

    res.status(200).json({
      status: "success",
      message: "Payment verified successfully",
      data: result.data,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorResponse = handleZodError(
        error,
        requestId,
        "Flutterwave payment verification"
      );
      res.status(errorResponse.status).json(errorResponse.body);
      return;
    }

    const errorResponse = handleGenericError(
      error,
      requestId,
      "Flutterwave payment verification"
    );
    res.status(errorResponse.status).json(errorResponse.body);
    return;
  }
};
