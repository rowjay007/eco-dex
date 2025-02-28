import { Novu } from "@novu/node";
import { appConfig } from "../config/app.config";
import { logger } from "../config/logger.config";
import {
  INotificationService,
  NotificationChannel,
  NotificationPayload,
  NotificationResult,
} from "../types";

const novu = new Novu(appConfig.novu.apiKey);

const sendNotification = async (
  payload: NotificationPayload
): Promise<NotificationResult> => {
  try {
    const response = await novu.trigger(payload.templateId, {
      to: {
        subscriberId: payload.to.email || payload.to.phone,
        email: payload.to.email,
        phone: payload.to.phone,
      },
      payload: payload.data,
      overrides: {
        email:
          payload.channel === "email"
            ? {
                from: appConfig.email?.user,
              }
            : undefined,
        sms:
          payload.channel === "sms"
            ? {
                from: appConfig.sms?.phoneNumber,
              }
            : undefined,
      },
    });

    logger.info(
      { templateId: payload.templateId, channel: payload.channel },
      "Notification sent successfully"
    );

    return {
      success: true,
      messageId: response.data?.triggeredNotificationId,
      channel: payload.channel || "email",
      response: response.data,
    };
  } catch (error) {
    logger.error(
      { error, templateId: payload.templateId, channel: payload.channel },
      "Failed to send notification"
    );

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      channel: payload.channel || "email",
    };
  }
};

const send = async (
  payload: NotificationPayload
): Promise<NotificationResult> => {
  logger.info(
    { templateId: payload.templateId, channel: payload.channel },
    "Sending notification"
  );
  return sendNotification(payload);
};

const sendBulk = async (
  payloads: NotificationPayload[]
): Promise<NotificationResult[]> => {
  logger.info({ count: payloads.length }, "Sending bulk notifications");

  const sendPromises = payloads.map((payload) => sendNotification(payload));
  return Promise.all(sendPromises);
};

const subscribeToTemplate = async (
  subscriberId: string,
  templateId: string,
  channels: NotificationChannel[]
): Promise<void> => {
  try {
    await novu.subscribers.identify(subscriberId, {
      email: subscriberId.includes("@") ? subscriberId : undefined,
      phone: subscriberId.match(/^\+?\d+$/) ? subscriberId : undefined,
    });

    await novu.subscribers.setCredentials(subscriberId, {
      email: channels.includes("email"),
      sms: channels.includes("sms"),
      push: channels.includes("push"),
    });

    logger.info(
      { subscriberId, templateId, channels },
      "Subscriber preferences updated"
    );
  } catch (error) {
    logger.error(
      { error, subscriberId, templateId },
      "Failed to update subscriber preferences"
    );
    throw error;
  }
};

export const notificationService: INotificationService = {
  send,
  sendBulk,
};

export { subscribeToTemplate };
