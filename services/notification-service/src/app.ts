import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { notificationRoutes } from './routes/notification.routes';
import { logger } from './config/logger.config';
import { appConfig } from './config/app.config';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  logger.info({ method: req.method, url: req.url }, 'Incoming request');
  next();
});

// Routes
app.use('/api/notifications', notificationRoutes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error({ err }, 'Unhandled error');
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
});

const port = appConfig.port;

app.listen(port, () => {
  logger.info({ port }, 'Notification service started');
});

export default app;