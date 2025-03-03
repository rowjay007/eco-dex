// @ts-nocheck
import { appConfig } from "../config/app.config";
import { logger } from "../config/logger.config";
import { novuClient } from "../config/novu.config";
import { NotificationPayload, NotificationResult } from "../types";
import { BaseNotificationProvider } from "./base.provider";

export class SmsProvider extends BaseNotificationProvider {
  channel = "sms" as const;

  async send(payload: NotificationPayload): Promise<NotificationResult> {
    try {
      const response = await novuClient.trigger(payload.templateId, {
        to: {
          subscriberId: payload.to.phone!,
          phone: payload.to.phone,
        },
        payload: payload.data,
        overrides: {
          sms: {
            from: appConfig.sms?.phoneNumber,
          },
        },
      });

      logger.info(
        { templateId: payload.templateId, channel: this.channel },
        "SMS notification sent successfully"
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
        "Failed to send SMS notification"
      );
      return this.handleError(error, payload);
    }
  }
}
