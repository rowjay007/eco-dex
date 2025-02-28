import { Novu } from '@novu/node';
import { appConfig } from '../config/app.config';
import { logger } from '../config/logger.config';
import { NotificationPayload, NotificationResult } from '../types';
import { BaseNotificationProvider } from './base.provider';

export class PushProvider extends BaseNotificationProvider {
  private novu: Novu;

  private novu = new Novu(appConfig.novu.apiKey);

  constructor() {
    super();
  }

  channel = 'push' as const;

  async send(payload: NotificationPayload): Promise<NotificationResult> {
    try {
      const response = await this.novu.trigger(payload.templateId, {
        to: {
          subscriberId: payload.to.deviceTokens?.[0] || '',
          deviceTokens: payload.to.deviceTokens,
        },
        payload: payload.data,
        overrides: {
          push: {
            title: payload.data.title,
            body: payload.data.body,
            data: payload.data,
          },
        },
      });

      logger.info(
        { templateId: payload.templateId, channel: this.channel },
        'Push notification sent successfully'
      );

      return {
        success: true,
        messageId: response.data?.triggeredNotificationId,
        channel: this.channel,
        response: response.data,
      };
    } catch (error) {
      logger.error(
        { error, templateId: payload.templateId, channel: this.channel },
        'Failed to send push notification'
      );
      return this.handleError(error, payload);
    }
  }
}