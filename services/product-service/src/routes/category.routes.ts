import { Router } from "express";
import { categoryController } from "../controllers/category.controller";

const router = Router();

router
  .route("/")
  .post(categoryController.createCategory)
  .get(categoryController.listCategories);

router.get("/hierarchy", categoryController.getCategoryHierarchy);

router
  .route("/:id")
  .get(categoryController.getCategory)
  .patch(categoryController.updateCategory)
  .delete(categoryController.deleteCategory);

export default router;
