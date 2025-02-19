import { eq } from "drizzle-orm";
import { db } from "../config/database.config";
import { shipments, type Shipment, type ShipmentInsert } from "../models/shipment.model";
import { AppError } from "../utils/AppError";
import logger from "@/utils/logger";
import * as RedisService from "./redis.service";

export const createShipment = async (shipmentData: ShipmentInsert): Promise<Shipment> => {
  try {
    const [shipment] = await db
      .insert(shipments)
      .values(shipmentData)
      .returning();

    await RedisService.setShipment(shipment.id, shipment);
    return shipment;
  } catch (error) {
    logger.error("Error creating shipment:", error);
    throw new AppError("Failed to create shipment", 500);
  }
};

export const getShipment = async (shipmentId: string): Promise<Shipment> => {
  try {
    const cachedShipment = await RedisService.getShipment(shipmentId);
    if (cachedShipment) return cachedShipment;

    const shipment = await db
      .select()
      .from(shipments)
      .where(eq(shipments.id, shipmentId))
      .then((res) => res[0]);

    if (!shipment) {
      throw new AppError("Shipment not found", 404);
    }

    await RedisService.setShipment(shipmentId, shipment);
    return shipment;
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error("Error getting shipment:", error);
    throw new AppError("Failed to get shipment", 500);
  }
};

export const getShipmentByOrderId = async (orderId: string): Promise<Shipment> => {
  try {
    const shipment = await db
      .select()
      .from(shipments)
      .where(eq(shipments.orderId, orderId))
      .then((res) => res[0]);

    if (!shipment) {
      throw new AppError("Shipment not found for order", 404);
    }

    await RedisService.setShipment(shipment.id, shipment);
    return shipment;
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error("Error getting shipment by order ID:", error);
    throw new AppError("Failed to get shipment", 500);
  }
};

export const updateShipmentStatus = async (shipmentId: string, status: string): Promise<Shipment> => {
  try {
    const [updatedShipment] = await db
      .update(shipments)
      .set({ status, updatedAt: new Date() })
      .where(eq(shipments.id, shipmentId))
      .returning();

    if (!updatedShipment) {
      throw new AppError("Shipment not found", 404);
    }

    await RedisService.setShipment(shipmentId, updatedShipment);
    return updatedShipment;
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error("Error updating shipment status:", error);
    throw new AppError("Failed to update shipment status", 500);
  }
};

export const updateTrackingInfo = async (
  shipmentId: string,
  trackingNumber: string,
  estimatedDeliveryDate: Date
): Promise<Shipment> => {
  try {
    const [updatedShipment] = await db
      .update(shipments)
      .set({
        trackingNumber,
        estimatedDeliveryDate,
        updatedAt: new Date(),
      })
      .where(eq(shipments.id, shipmentId))
      .returning();

    if (!updatedShipment) {
      throw new AppError("Shipment not found", 404);
    }

    await RedisService.setShipment(shipmentId, updatedShipment);
    return updatedShipment;
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error("Error updating tracking info:", error);
    throw new AppError("Failed to update tracking information", 500);
  }
};

export const markDelivered = async (shipmentId: string): Promise<Shipment> => {
  try {
    const [updatedShipment] = await db
      .update(shipments)
      .set({
        status: "delivered",
        actualDeliveryDate: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(shipments.id, shipmentId))
      .returning();

    if (!updatedShipment) {
      throw new AppError("Shipment not found", 404);
    }

    await RedisService.setShipment(shipmentId, updatedShipment);
    return updatedShipment;
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error("Error marking shipment as delivered:", error);
    throw new AppError("Failed to mark shipment as delivered", 500);
  }
};

export const deleteShipment = async (shipmentId: string): Promise<void> => {
  try {
    const shipment = await getShipment(shipmentId);
    if (!shipment) {
      throw new AppError("Shipment not found", 404);
    }

    await db.delete(shipments).where(eq(shipments.id, shipmentId));
    await RedisService.deleteShipment(shipmentId);
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error("Error deleting shipment:", error);
    throw new AppError("Failed to delete shipment", 500);
  }
};

export const getAllShipments = async (): Promise<Shipment[]> => {
  try {
    const cachedShipments = await RedisService.getAllShipments();
    if (cachedShipments) return cachedShipments;

    const shipmentsList = await db
      .select()
      .from(shipments);

    await RedisService.setAllShipments(shipmentsList);
    return shipmentsList;
  } catch (error) {
    logger.error("Error listing shipments:", error);
    throw new AppError("Failed to list shipments", 500);
  }
};