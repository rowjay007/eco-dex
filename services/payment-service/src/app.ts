import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { json } from 'express';
import winston from 'winston';

import paymentRoutes from './routes/payment.routes';
import webhookRoutes from './routes/webhook.routes';
import { appConfig } from './config/app.config';

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(json());

// Request logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.path}`, {
    query: req.query,
    body: req.body,
    headers: req.headers
  });
  next();
});

// Routes
app.use('/api/payments', paymentRoutes);
app.use('/api/webhooks', webhookRoutes);

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'healthy' });
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error('Unhandled error:', { error: err });
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: appConfig.env === 'development' ? err.message : 'An unexpected error occurred'
    }
  });
});

// Start server
if (require.main === module) {
  const port = appConfig.port;
  app.listen(port, () => {
    logger.info(`Payment service listening on port ${port}`);
  });
}

export default app;