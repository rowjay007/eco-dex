import { NotificationChannel, NotificationPayload, NotificationResult } from '../types';
import { INotificationProvider } from './base.provider';
import { EmailProvider } from './email.provider';
import { SmsProvider } from './sms.provider';
import { PushProvider } from './push.provider';

class NotificationProviderFactory {
  private static providers: Map<NotificationChannel, INotificationProvider> = new Map();

  static getProvider(channel: NotificationChannel): INotificationProvider {
    let provider = this.providers.get(channel);

    if (!provider) {
      switch (channel) {
        case 'email':
          provider = new EmailProvider();
          break;
        case 'sms':
          provider = new SmsProvider();
          break;
        case 'push':
          provider = new PushProvider();
          break;
        default:
          throw new Error(`Unsupported notification channel: ${channel}`);
      }
      this.providers.set(channel, provider);
    }

    return provider;
  }

  static async send(payload: NotificationPayload): Promise<NotificationResult> {
    const channel = payload.channel || 'email';
    const provider = this.getProvider(channel);
    return provider.send(payload);
  }
}

export { NotificationProviderFactory, INotificationProvider };
export { EmailProvider } from './email.provider';
export { SmsProvider } from './sms.provider';
export { PushProvider } from './push.provider';