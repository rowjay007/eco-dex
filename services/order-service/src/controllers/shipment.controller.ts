import { Request, Response, NextFunction } from "express";
import * as ShipmentService from "../services/shipment.service";
import { AppError } from "../utils/AppError";

export const getAllShipments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const shipments = await ShipmentService.getAllShipments();
    res.status(200).json({
      status: "success",
      data: shipments,
    });
  } catch (error) {
    next(error);
  }
};

export const getShipmentById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const shipment = await ShipmentService.getShipment(req.params.id);
    res.status(200).json({
      status: "success",
      data: shipment,
    });
  } catch (error) {
    next(error);
  }
};

export const createShipment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const shipment = await ShipmentService.createShipment(req.body);
    res.status(201).json({
      status: "success",
      data: shipment,
    });
  } catch (error) {
    next(error);
  }
};

export const updateShipment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, trackingNumber, estimatedDeliveryDate } = req.body;
    let updatedShipment;

    if (status) {
      updatedShipment = await ShipmentService.updateShipmentStatus(req.params.id, status);
    } else if (trackingNumber && estimatedDeliveryDate) {
      updatedShipment = await ShipmentService.updateTrackingInfo(
        req.params.id,
        trackingNumber,
        new Date(estimatedDeliveryDate)
      );
    } else {
      throw new AppError("Invalid update parameters", 400);
    }

    res.status(200).json({
      status: "success",
      data: updatedShipment,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteShipment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await ShipmentService.deleteShipment(req.params.id);
    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
