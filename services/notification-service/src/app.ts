import cors from "cors";
import express from "express";
import helmet from "helmet";
import { appConfig } from "./config/app.config";
import { logger } from "./config/logger.config";
import { notificationRoutes } from "./routes/notification.routes";

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req: any, res: any, next: any) => {
  logger.info({ method: req.method, url: req.url }, "Incoming request");
  next();
});

// Routes
app.use("/api/notifications", notificationRoutes);

// Error handling middleware
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    logger.error({ err }, "Unhandled error");
    res.status(500).json({
      success: false,
      error: err.message || "Internal server error",
    });
  }
);

const port = appConfig.port;

app.listen(port, () => {
  logger.info({ port }, "Notification service started");
});

export default app;
