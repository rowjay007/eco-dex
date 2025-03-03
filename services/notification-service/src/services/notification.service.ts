import { logger } from "../config/logger.config";
import { novuClient } from "../config/novu.config";
import {
  INotificationService,
  NotificationChannel,
  NotificationPayload,
  NotificationResult,
} from "../types";

const sendNotification = async (
  payload: NotificationPayload
): Promise<NotificationResult> => {
  try {
    const recipientId = payload.to.email || payload.to.phone;
    if (!recipientId) {
      throw new Error("Recipient email or phone is required");
    }

    const response = await novuClient.trigger(payload.templateId, {
      to: { subscriberId: recipientId },
      payload: payload.data,
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
    await novuClient.subscribers.identify(subscriberId, {
      email: subscriberId.includes("@") ? subscriberId : undefined,
      phone: subscriberId.match(/^\+?\d+$/) ? subscriberId : undefined,
    });

    // Use type assertion to bypass the type checking
    // This is a temporary solution until the proper types can be resolved
    const channelCredentials = {
      email: channels.includes("email"),
      sms: channels.includes("sms"),
      push: channels.includes("push"),
    };

    await novuClient.subscribers.setCredentials(
      subscriberId,
      "novu",
      channelCredentials as any
    );

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
