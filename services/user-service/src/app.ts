import cors from "cors";
import { config } from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import helmet from "helmet";
import appConfig from "./config/app.config";
import authRoutes from "./routes/auth.routes";
import { AppError } from "./utils/AppError";
import logger from "./utils/logger";

config();

const app = express();

app.use(cors(appConfig.cors));
app.use(helmet());
app.use(express.json());

app.use("/auth", authRoutes);

app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  logger.error("Error:", { error: err, path: req.path, method: req.method });

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
  }

  const statusCode = 500;
  const message =
    process.env.NODE_ENV === "development"
      ? err.message
      : "Internal server error";

  return res.status(statusCode).json({
    success: false,
    message,
  });
});

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

export default app;
