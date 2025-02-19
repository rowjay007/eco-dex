import { producer } from "../config/kafka.config";
import logger from "@/utils/logger";
import type { Order } from "../models/order.model";
import type { Shipment } from "../models/shipment.model";

export const ORDER_TOPICS = {
  ORDER_CREATED: "order.created",
  ORDER_UPDATED: "order.updated",
  ORDER_CANCELLED: "order.cancelled",
  PAYMENT_STATUS_UPDATED: "order.payment.updated",
  SHIPMENT_CREATED: "order.shipment.created",
  SHIPMENT_UPDATED: "order.shipment.updated",
  SHIPMENT_DELIVERED: "order.shipment.delivered"
};

export const publishOrderCreated = async (order: Order) => {
  try {
    await producer.send({
      topic: ORDER_TOPICS.ORDER_CREATED,
      messages: [{ value: JSON.stringify(order) }],
    });
    logger.info(`Order created event published for order ${order.id}`);
  } catch (error) {
    logger.error("Error publishing order created event:", error);
  }
};

export const publishOrderUpdated = async (order: Order) => {
  try {
    await producer.send({
      topic: ORDER_TOPICS.ORDER_UPDATED,
      messages: [{ value: JSON.stringify(order) }],
    });
    logger.info(`Order updated event published for order ${order.id}`);
  } catch (error) {
    logger.error("Error publishing order updated event:", error);
  }
};

export const publishOrderCancelled = async (order: Order) => {
  try {
    await producer.send({
      topic: ORDER_TOPICS.ORDER_CANCELLED,
      messages: [{ value: JSON.stringify(order) }],
    });
    logger.info(`Order cancelled event published for order ${order.id}`);
  } catch (error) {
    logger.error("Error publishing order cancelled event:", error);
  }
};

export const publishPaymentStatusUpdated = async (order: Order) => {
  try {
    await producer.send({
      topic: ORDER_TOPICS.PAYMENT_STATUS_UPDATED,
      messages: [{ value: JSON.stringify(order) }],
    });
    logger.info(`Payment status updated event published for order ${order.id}`);
  } catch (error) {
    logger.error("Error publishing payment status updated event:", error);
  }
};

export const publishShipmentCreated = async (shipment: Shipment) => {
  try {
    await producer.send({
      topic: ORDER_TOPICS.SHIPMENT_CREATED,
      messages: [{ value: JSON.stringify(shipment) }],
    });
    logger.info(`Shipment created event published for shipment ${shipment.id}`);
  } catch (error) {
    logger.error("Error publishing shipment created event:", error);
  }
};

export const publishShipmentUpdated = async (shipment: Shipment) => {
  try {
    await producer.send({
      topic: ORDER_TOPICS.SHIPMENT_UPDATED,
      messages: [{ value: JSON.stringify(shipment) }],
    });
    logger.info(`Shipment updated event published for shipment ${shipment.id}`);
  } catch (error) {
    logger.error("Error publishing shipment updated event:", error);
  }
};

export const publishShipmentDelivered = async (shipment: Shipment) => {
  try {
    await producer.send({
      topic: ORDER_TOPICS.SHIPMENT_DELIVERED,
      messages: [{ value: JSON.stringify(shipment) }],
    });
    logger.info(`Shipment delivered event published for shipment ${shipment.id}`);
  } catch (error) {
    logger.error("Error publishing shipment delivered event:", error);
  }
};