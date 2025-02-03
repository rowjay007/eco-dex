import { Request, Response } from "express";
import { categoryService } from "../services/category.service";
import { catchAsync } from "../utils/catchAsync";

export class CategoryController {
  createCategory = catchAsync(async (req: Request, res: Response) => {
    const category = await categoryService.createCategory(req.body);
    res.status(201).json({
      status: "success",
      data: { category },
    });
  });

  getCategory = catchAsync(async (req: Request, res: Response) => {
    const category = await categoryService.getCategory(req.params.id);
    res.status(200).json({
      status: "success",
      data: { category },
    });
  });

  updateCategory = catchAsync(async (req: Request, res: Response) => {
    const category = await categoryService.updateCategory(
      req.params.id,
      req.body
    );
    res.status(200).json({
      status: "success",
      data: { category },
    });
  });

  deleteCategory = catchAsync(async (req: Request, res: Response) => {
    await categoryService.deleteCategory(req.params.id);
    res.status(204).json({
      status: "success",
      data: null,
    });
  });

  listCategories = catchAsync(async (req: Request, res: Response) => {
    const categories = await categoryService.listCategories();
    res.status(200).json({
      status: "success",
      data: { categories },
    });
  });

  getCategoryHierarchy = catchAsync(async (req: Request, res: Response) => {
    const hierarchy = await categoryService.getCategoryHierarchy();
    res.status(200).json({
      status: "success",
      data: { hierarchy },
    });
  });
}

export const categoryController = new CategoryController();
