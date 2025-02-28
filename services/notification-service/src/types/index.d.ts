import { NotificationTriggerResponse } from '@novu/node';

export type NotificationChannel = 'email' | 'sms' | 'push';

export type NotificationPriority = 'low' | 'normal' | 'high';

export interface NotificationPayload {
  to: {
    email?: string;
    phone?: string;
    deviceTokens?: string[];
  };
  templateId: string;
  data: Record<string, any>;
  channel?: NotificationChannel;
  priority?: NotificationPriority;
  metadata?: Record<string, any>;
}

export interface NotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
  channel: NotificationChannel;
  response?: NotificationTriggerResponse;
}

export interface INotificationService {
  send(payload: NotificationPayload): Promise<NotificationResult>;
  sendBulk(payloads: NotificationPayload[]): Promise<NotificationResult[]>;
}

export interface KafkaNotificationEvent {
  type: string;
  payload: NotificationPayload;
  timestamp: string;
  metadata?: Record<string, any>;
}

export type NotificationTemplate = {
  id: string;
  name: string;
  description?: string;
  channels: NotificationChannel[];
  content: {
    email?: {
      subject: string;
      body: string;
    };
    sms?: {
      body: string;
    };
    push?: {
      title: string;
      body: string;
      data?: Record<string, any>;
    };
  };
  metadata?: Record<string, any>;
};