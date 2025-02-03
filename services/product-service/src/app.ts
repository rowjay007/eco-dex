import cors from "cors";
import { config } from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import helmet from "helmet";
import { AppError } from "./utils/AppError.js";
import logger from "./utils/logger.js";

config();

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  logger.error("Error:", { error: err, path: req.path, method: req.method });

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
  }

  // Handle other errors
  const statusCode = 500;
  const message =
    process.env.NODE_ENV === "development"
      ? err.message
      : "Internal server error";

  // Send a generic error response
  return res.status(statusCode).json({
    success: false,
    message,
  });
});

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

export default app;
