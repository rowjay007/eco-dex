import { Router } from "express";
import * as productController  from "../controllers/product.controller";

const router = Router();

router
  .route("/")
  .post(productController.createProduct)
  .get(productController.listProducts);

router.get("/search", productController.searchProducts);

router
  .route("/:id")
  .get(productController.getProduct)
  .patch(productController.updateProduct)
  .delete(productController.deleteProduct);

export default router;
