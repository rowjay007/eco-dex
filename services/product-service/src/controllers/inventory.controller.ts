import { Request, Response } from "express";
import { inventoryService } from "../services/inventory.service";
import { AppError } from "../utils/AppError";
import { catchAsync } from "../utils/catchAsync";

export const createInventory = catchAsync(
  async (req: Request, res: Response) => {
    const inventory = await inventoryService.createInventory(req.body);
    res.status(201).json({
      status: "success",
      data: { inventory },
    });
  }
);

export const getInventory = catchAsync(async (req: Request, res: Response) => {
  const inventory = await inventoryService.getInventory(req.params.productId);
  res.status(200).json({
    status: "success",
    data: { inventory },
  });
});

export const updateInventory = catchAsync(
  async (req: Request, res: Response) => {
    const inventory = await inventoryService.updateInventory(
      req.params.productId,
      req.body
    );
    res.status(200).json({
      status: "success",
      data: { inventory },
    });
  }
);

export const reserveStock = catchAsync(async (req: Request, res: Response) => {
  const { quantity } = req.body;
  if (!quantity || quantity <= 0) {
    throw new AppError("Valid quantity is required", 400);
  }

  const inventory = await inventoryService.reserveStock(
    req.params.productId,
    quantity
  );
  res.status(200).json({
    status: "success",
    data: { inventory },
  });
});

export const releaseStock = catchAsync(async (req: Request, res: Response) => {
  const { quantity } = req.body;
  if (!quantity || quantity <= 0) {
    throw new AppError("Valid quantity is required", 400);
  }

  const inventory = await inventoryService.releaseStock(
    req.params.productId,
    quantity
  );
  res.status(200).json({
    status: "success",
    data: { inventory },
  });
});

export const adjustStock = catchAsync(async (req: Request, res: Response) => {
  const { adjustment } = req.body;
  if (adjustment === undefined) {
    throw new AppError("Stock adjustment value is required", 400);
  }

  const inventory = await inventoryService.adjustStock(
    req.params.productId,
    adjustment
  );
  res.status(200).json({
    status: "success",
    data: { inventory },
  });
});

export const checkLowStock = catchAsync(async (req: Request, res: Response) => {
  const reorderThreshold = req.query.threshold
    ? parseInt(req.query.threshold as string)
    : undefined;
  const lowStockItems = await inventoryService.checkLowStock(reorderThreshold);
  res.status(200).json({
    status: "success",
    data: { lowStockItems },
  });
});
