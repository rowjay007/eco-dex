import { Request, Response } from 'express';
import { logger } from '../config/logger.config';
import { notificationService, subscribeToTemplate } from '../services/notification.service';
import { NotificationPayload } from '../types';

export const notificationController = {
  async send(req: Request, res: Response) {
    try {
      const payload = req.body as NotificationPayload;
      const result = await notificationService.send(payload);
      res.json(result);
    } catch (error) {
      logger.error({ error }, 'Failed to send notification');
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  async sendBulk(req: Request, res: Response) {
    try {
      const payloads = req.body as NotificationPayload[];
      const results = await notificationService.sendBulk(payloads);
      res.json(results);
    } catch (error) {
      logger.error({ error }, 'Failed to send bulk notifications');
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  async subscribe(req: Request, res: Response) {
    try {
      const { subscriberId, templateId, channels } = req.body;
      await subscribeToTemplate(subscriberId, templateId, channels);
      res.json({ success: true });
    } catch (error) {
      logger.error({ error }, 'Failed to subscribe to template');
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },
};