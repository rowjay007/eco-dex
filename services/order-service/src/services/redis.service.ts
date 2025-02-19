import { Redis } from "@upstash/redis";
import { env } from "../config/app.config";
import logger from "@/utils/logger";
import type { Order, OrderItem } from "../models/order.model";
import type { Shipment } from "../models/shipment.model";

const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});

const ORDER_PREFIX = "order:";
const ORDER_ITEMS_PREFIX = "order:items:";
const SHIPMENT_PREFIX = "shipment:";
const CACHE_TTL = 3600; // 1 hour in seconds

export const setOrder = async (orderId: string, order: Order): Promise<void> => {
  try {
    await redis.set(`${ORDER_PREFIX}${orderId}`, JSON.stringify(order), { ex: CACHE_TTL });
  } catch (error) {
    logger.error("Error setting order in Redis:", error);
  }
};

export const getOrder = async (orderId: string): Promise<Order | null> => {
  try {
    const order = await redis.get(`${ORDER_PREFIX}${orderId}`);
    return order ? JSON.parse(order as string) : null;
  } catch (error) {
    logger.error("Error getting order from Redis:", error);
    return null;
  }
};

export const setOrderItems = async (orderId: string, items: OrderItem[]): Promise<void> => {
  try {
    await redis.set(`${ORDER_ITEMS_PREFIX}${orderId}`, JSON.stringify(items), { ex: CACHE_TTL });
  } catch (error) {
    logger.error("Error setting order items in Redis:", error);
  }
};

export const getOrderItems = async (orderId: string): Promise<OrderItem[] | null> => {
  try {
    const items = await redis.get(`${ORDER_ITEMS_PREFIX}${orderId}`);
    return items ? JSON.parse(items as string) : null;
  } catch (error) {
    logger.error("Error getting order items from Redis:", error);
    return null;
  }
};

export const setShipment = async (shipmentId: string, shipment: Shipment): Promise<void> => {
  try {
    await redis.set(`${SHIPMENT_PREFIX}${shipmentId}`, JSON.stringify(shipment), { ex: CACHE_TTL });
  } catch (error) {
    logger.error("Error setting shipment in Redis:", error);
  }
};

export const getShipment = async (shipmentId: string): Promise<Shipment | null> => {
  try {
    const shipment = await redis.get(`${SHIPMENT_PREFIX}${shipmentId}`);
    return shipment ? JSON.parse(shipment as string) : null;
  } catch (error) {
    logger.error("Error getting shipment from Redis:", error);
    return null;
  }
};

export const getAllShipments = async (): Promise<Shipment[] | null> => {
  try {
    const shipments = await redis.get(`${SHIPMENT_PREFIX}all`);
    return shipments ? JSON.parse(shipments as string) : null;
  } catch (error) {
    logger.error("Error getting all shipments from Redis:", error);
    return null;
  }
};

export const setAllShipments = async (shipments: Shipment[]): Promise<void> => {
  try {
    await redis.set(`${SHIPMENT_PREFIX}all`, JSON.stringify(shipments));
  } catch (error) {
    logger.error("Error setting all shipments in Redis:", error);
  }
};

export const deleteOrder = async (orderId: string): Promise<void> => {
  try {
    await Promise.all([
      redis.del(`${ORDER_PREFIX}${orderId}`),
      redis.del(`${ORDER_ITEMS_PREFIX}${orderId}`)
    ]);
  } catch (error) {
    logger.error("Error deleting order from Redis:", error);
  }
};

export const deleteShipment = async (shipmentId: string): Promise<void> => {
  try {
    await redis.del(`${SHIPMENT_PREFIX}${shipmentId}`);
  } catch (error) {
    logger.error("Error deleting shipment from Redis:", error);
  }
};