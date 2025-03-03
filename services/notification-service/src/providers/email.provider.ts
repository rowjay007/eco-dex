import { appConfig } from "../config/app.config";
import { logger } from "../config/logger.config";
import { novuClient } from "../config/novu.config";
import { NotificationPayload, NotificationResult } from "../types";
import { BaseNotificationProvider } from "./base.provider";

export class EmailProvider extends BaseNotificationProvider {
  channel = "email" as const;

  async send(payload: NotificationPayload): Promise<NotificationResult> {
    try {
      const response = await novuClient.trigger(payload.templateId, {
        to: {
          subscriberId: payload.to.email!,
          email: payload.to.email,
        },
        payload: payload.data,
        overrides: {
          email: {
            from: appConfig.email?.user,
          },
        },
      });

      logger.info(
        { templateId: payload.templateId, channel: this.channel },
        "Email notification sent successfully"
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
        "Failed to send email notification"
      );
      return this.handleError(error, payload);
    }
  }
}
