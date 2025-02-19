import { Request, Response } from "express";
import * as OrderService from "../services/order.service";
import { catchAsync } from "../utils/catchAsync";

export const getAllOrders = catchAsync(async (req: Request, res: Response) => {
  const orders = await OrderService.listOrders();
  res.status(200).json({
    status: "success",
    data: { orders },
  });
});

export const getOrderById = catchAsync(async (req: Request, res: Response) => {
  const order = await OrderService.getOrder(req.params.id);
  res.status(200).json({
    status: "success",
    data: { order },
  });
});

export const createOrder = catchAsync(async (req: Request, res: Response) => {
  const { items, ...orderData } = req.body;
  const order = await OrderService.createOrder(orderData, items);
  res.status(201).json({
    status: "success",
    data: { order },
  });
});

export const updateOrder = catchAsync(async (req: Request, res: Response) => {
  const order = await OrderService.updateOrderStatus(
    req.params.id,
    req.body.status
  );
  res.status(200).json({
    status: "success",
    data: { order },
  });
});

export const deleteOrder = catchAsync(async (req: Request, res: Response) => {
  await OrderService.deleteOrder(req.params.id);
  res.status(204).json({
    status: "success",
    data: null,
  });
});

export const listOrders = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const result = await OrderService.listOrders(page, limit);
  res.status(200).json({
    status: "success",
    data: result,
  });
});
export function getAllShipments(arg0: string, getAllShipments: any) {
    throw new Error("Function not implemented.");
}

export function getShipmentById(arg0: string, getShipmentById: any) {
    throw new Error("Function not implemented.");
}

export function deleteShipment(arg0: string, deleteShipment: any) {
    throw new Error("Function not implemented.");
}

