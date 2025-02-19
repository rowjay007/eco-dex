import { consumer } from "../config/kafka.config";
import logger from "@/utils/logger";
import * as OrderService from "../services/order.service";
import * as ShipmentService from "../services/shipment.service";

export const CONSUMER_TOPICS = {
  PAYMENT_COMPLETED: "payment.completed",
  PAYMENT_FAILED: "payment.failed",
  INVENTORY_RESERVED: "inventory.reserved",
  INVENTORY_RELEASED: "inventory.released"
};

export const setupConsumers = async () => {
  try {
    // Subscribe to payment-related topics
    await consumer.subscribe({
      topics: [CONSUMER_TOPICS.PAYMENT_COMPLETED, CONSUMER_TOPICS.PAYMENT_FAILED],
    });

    // Subscribe to inventory-related topics
    await consumer.subscribe({
      topics: [CONSUMER_TOPICS.INVENTORY_RESERVED, CONSUMER_TOPICS.INVENTORY_RELEASED],
    });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const value = message.value?.toString();
          if (!value) return;

          const data = JSON.parse(value);
          logger.info(`Received message on topic ${topic}:`, data);

          switch (topic) {
            case CONSUMER_TOPICS.PAYMENT_COMPLETED:
              await handlePaymentCompleted(data);
              break;
            case CONSUMER_TOPICS.PAYMENT_FAILED:
              await handlePaymentFailed(data);
              break;
            case CONSUMER_TOPICS.INVENTORY_RESERVED:
              await handleInventoryReserved(data);
              break;
            case CONSUMER_TOPICS.INVENTORY_RELEASED:
              await handleInventoryReleased(data);
              break;
            default:
              logger.warn(`No handler for topic ${topic}`);
          }
        } catch (error) {
          logger.error(`Error processing message from topic ${topic}:`, error);
        }
      },
    });

    logger.info("Kafka consumers set up successfully");
  } catch (error) {
    logger.error("Error setting up Kafka consumers:", error);
    throw error;
  }
};

const handlePaymentCompleted = async (data: any) => {
  try {
    const { orderId } = data;
    await OrderService.updatePaymentStatus(orderId, "completed");
    await OrderService.updateOrderStatus(orderId, "processing");

    // Create shipment after payment is completed
    await ShipmentService.createShipment({
      orderId,
      status: "pending",
      carrier: data.carrier || "default",
      shippingMethod: data.shippingMethod || "standard"
    });
  } catch (error) {
    logger.error("Error handling payment completed event:", error);
  }
};

const handlePaymentFailed = async (data: any) => {
  try {
    const { orderId } = data;
    await OrderService.updatePaymentStatus(orderId, "failed");
    await OrderService.updateOrderStatus(orderId, "cancelled");
  } catch (error) {
    logger.error("Error handling payment failed event:", error);
  }
};

const handleInventoryReserved = async (data: any) => {
  try {
    const { orderId } = data;
    await OrderService.updateOrderStatus(orderId, "confirmed");
  } catch (error) {
    logger.error("Error handling inventory reserved event:", error);
  }
};

const handleInventoryReleased = async (data: any) => {
  try {
    const { orderId } = data;
    await OrderService.updateOrderStatus(orderId, "cancelled");
  } catch (error) {
    logger.error("Error handling inventory released event:", error);
  }
};