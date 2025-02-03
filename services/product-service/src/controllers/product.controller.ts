import { Request, Response } from "express";
import { productService } from "../services/product.service";
import { AppError } from "../utils/AppError";
import { catchAsync } from "../utils/catchAsync";

export class ProductController {
  createProduct = catchAsync(async (req: Request, res: Response) => {
    const product = await productService.createProduct(req.body);
    res.status(201).json({
      status: "success",
      data: { product },
    });
  });

  getProduct = catchAsync(async (req: Request, res: Response) => {
    const product = await productService.getProduct(req.params.id);
    res.status(200).json({
      status: "success",
      data: { product },
    });
  });

  updateProduct = catchAsync(async (req: Request, res: Response) => {
    const product = await productService.updateProduct(req.params.id, req.body);
    res.status(200).json({
      status: "success",
      data: { product },
    });
  });

  deleteProduct = catchAsync(async (req: Request, res: Response) => {
    await productService.deleteProduct(req.params.id);
    res.status(204).json({
      status: "success",
      data: null,
    });
  });

  listProducts = catchAsync(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await productService.listProducts(page, limit);
    res.status(200).json({
      status: "success",
      data: result,
    });
  });

  searchProducts = catchAsync(async (req: Request, res: Response) => {
    const { query } = req.query;
    if (!query) {
      throw new AppError("Search query is required", 400);
    }

    const products = await productService.searchProducts(query as string);
    res.status(200).json({
      status: "success",
      data: { products },
    });
  });
}

export const productController = new ProductController();
