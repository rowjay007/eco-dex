import compression from "compression";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import RateLimit from "express-rate-limit";
import helmet from "helmet";
import pinoHttp from "pino-http";
import { config } from "./config/app.config";
import { logger } from "./config/logger.config";
import { requestId } from "./middleware/request-id.middleware";
import routes from "./routes";

const app = express();

app.use(helmet());
app.use(cors());
app.use(requestId);

const limiter = RateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

app.use(compression());

app.use(
  pinoHttp({
    logger,
    autoLogging: {
      ignore: (req) => req.url === "/health",
    },
    customProps: (req) => ({
      context: "http",
      "request-id": req.id,
    }),
  })
);

app.use("/api", routes);

app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: "error",
    message: `Cannot ${req.method} ${req.url}`,
  });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error("🔥 Unhandled error:", { error: err, path: req.path });
  res.status(500).json({
    status: "error",
    message:
      config.NODE_ENV === "production" ? "Internal server error" : err.message,
  });
});

export { app };