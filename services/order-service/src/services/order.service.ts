import logger from "@/utils/logger";
import { eq, sql } from "drizzle-orm";
import { db } from "../config/database.config";
import {
  orderItems,
  orders,
  type Order,
  type OrderInsert,
  type OrderItem,
  type OrderItemInsert,
} from "../models/order.model";
import { AppError } from "../utils/AppError";
import * as RedisService from "./redis.service";

export const createOrder = async (
  orderData: OrderInsert,
  items: OrderItemInsert[]
): Promise<Order> => {
  try {
    const [order] = await db.insert(orders).values(orderData).returning();

    const orderItemsData = items.map((item) => ({
      ...item,
      orderId: order.id,
    }));
    const insertedItems = await db
      .insert(orderItems)
      .values(orderItemsData)
      .returning();

    await RedisService.setOrder(order.id, order);
    await RedisService.setOrderItems(order.id, insertedItems);

    return order;
  } catch (error) {
    logger.error("Error creating order:", error);
    throw new AppError("Failed to create order", 500);
  }
};

export const getOrder = async (orderId: string): Promise<Order> => {
  try {
    const cachedOrder = await RedisService.getOrder(orderId);
    if (cachedOrder) return cachedOrder;

    const order = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .then((res) => res[0]);

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    await RedisService.setOrder(orderId, order);
    return order;
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error("Error getting order:", error);
    throw new AppError("Failed to get order", 500);
  }
};

export const getOrderItems = async (orderId: string): Promise<OrderItem[]> => {
  try {
    const cachedItems = await RedisService.getOrderItems(orderId);
    if (cachedItems) return cachedItems;

    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));

    await RedisService.setOrderItems(orderId, items);
    return items;
  } catch (error) {
    logger.error("Error getting order items:", error);
    throw new AppError("Failed to get order items", 500);
  }
};

export const updateOrderStatus = async (
  orderId: string,
  status: string
): Promise<Order> => {
  try {
    const [updatedOrder] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, orderId))
      .returning();

    if (!updatedOrder) {
      throw new AppError("Order not found", 404);
    }

    await RedisService.setOrder(orderId, updatedOrder);
    return updatedOrder;
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error("Error updating order status:", error);
    throw new AppError("Failed to update order status", 500);
  }
};

export const updatePaymentStatus = async (
  orderId: string,
  paymentStatus: string
): Promise<Order> => {
  try {
    const [updatedOrder] = await db
      .update(orders)
      .set({ paymentStatus, updatedAt: new Date() })
      .where(eq(orders.id, orderId))
      .returning();

    if (!updatedOrder) {
      throw new AppError("Order not found", 404);
    }

    await RedisService.setOrder(orderId, updatedOrder);
    return updatedOrder;
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error("Error updating payment status:", error);
    throw new AppError("Failed to update payment status", 500);
  }
};

export const deleteOrder = async (orderId: string): Promise<void> => {
  try {
    const order = await getOrder(orderId);
    if (!order) {
      throw new AppError("Order not found", 404);
    }

    await db.delete(orderItems).where(eq(orderItems.orderId, orderId));
    await db.delete(orders).where(eq(orders.id, orderId));
    await RedisService.deleteOrder(orderId);
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error("Error deleting order:", error);
    throw new AppError("Failed to delete order", 500);
  }
};

export const listOrders = async (
  page: number = 1,
  limit: number = 10
): Promise<{ orders: Order[]; total: number }> => {
  try {
    const offset = (page - 1) * limit;
    const ordersList = await db
      .select()
      .from(orders)
      .limit(limit)
      .offset(offset);

    const totalOrders = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .then((res) => Number(res[0].count));

    return {
      orders: ordersList,
      total: totalOrders,
    };
  } catch (error) {
    logger.error("Error listing orders:", error);
    throw new AppError("Failed to list orders", 500);
  }
};
