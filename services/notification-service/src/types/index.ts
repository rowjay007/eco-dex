export type NotificationChannel = "email" | "sms" | "push";

export interface NotificationRecipient {
  email?: string;
  phone?: string;
  deviceTokens?: string[];
}

export interface NotificationPayload {
  templateId: string;
  to: NotificationRecipient;
  channel?: NotificationChannel;
  data: Record<string, any>;
}

export interface NotificationResult {
  success: boolean;
  messageId?: string;
  channel: NotificationChannel;
  error?: string;
  response?: any;
}

export interface INotificationService {
  send(payload: NotificationPayload): Promise<NotificationResult>;
  sendBulk(payloads: NotificationPayload[]): Promise<NotificationResult[]>;
}

export interface IChannelCredentials {
  email?: boolean;
  sms?: boolean;
  push?: boolean;
}