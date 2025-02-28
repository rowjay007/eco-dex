import { NotificationChannel, NotificationPayload, NotificationResult } from '../types';

export interface INotificationProvider {
  channel: NotificationChannel;
  send(payload: NotificationPayload): Promise<NotificationResult>;
  isSupported(payload: NotificationPayload): boolean;
}

export abstract class BaseNotificationProvider implements INotificationProvider {
  abstract channel: NotificationChannel;

  abstract send(payload: NotificationPayload): Promise<NotificationResult>;

  isSupported(payload: NotificationPayload): boolean {
    return payload.channel === this.channel;
  }

  protected handleError(error: unknown, payload: NotificationPayload): NotificationResult {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      channel: this.channel,
    };
  }
}