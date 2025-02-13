import { Request, Response } from "express";
import * as CategoryService from "../services/category.service";
import { AppError } from "../utils/AppError";

const handleError = (res: Response, error: unknown) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      errors: error.errors,
    });
  }

  console.error("Unhandled error:", error);
  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const category = await CategoryService.createCategory(req.body);
    res.status(201).json({
      success: true,
      data: { category },
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const getCategory = async (req: Request, res: Response) => {
  try {
    const category = await CategoryService.getCategory(req.params.id);
    res.status(200).json({
      success: true,
      data: { category },
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const category = await CategoryService.updateCategory(
      req.params.id,
      req.body
    );
    res.status(200).json({
      success: true,
      data: { category },
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    await CategoryService.deleteCategory(req.params.id);
    res.status(204).send();
  } catch (error) {
    handleError(res, error);
  }
};

export const listCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await CategoryService.listCategories();
    res.status(200).json({
      success: true,
      data: { categories },
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const getCategoryHierarchy = async (_req: Request, res: Response) => {
  try {
    const hierarchy = await CategoryService.getCategoryHierarchy();
    res.status(200).json({
      success: true,
      data: { hierarchy },
    });
  } catch (error) {
    handleError(res, error);
  }
};
