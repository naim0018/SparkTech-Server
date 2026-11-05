import { Router } from "express";
import validateRequest from "../../app/middleware/validateRequest";
import auth from "../../app/middleware/auth";
import { USER_ROLE } from "../User/user.constant";
import { ProductController } from "./product.controller";
import { ProductZodValidation } from "./product.validation";

const router = Router();

// Public routes
router.get("/", ProductController.getAllProduct);
router.get("/new-arrivals", ProductController.getNewArrivals);
router.get("/category/:category", ProductController.getProductsByCategory);
router.get("/:id", ProductController.getProductById);

// Admin-only routes
router.post(
  "/add-product",
  auth(USER_ROLE.ADMIN as "admin"),
  validateRequest(ProductZodValidation.productSchemaZod),
  ProductController.addProduct
);
router.patch(
  "/:id/update-product",
  auth(USER_ROLE.ADMIN as "admin"),
  ProductController.updateProductById
);
router.delete(
  "/:id/delete-product",
  auth(USER_ROLE.ADMIN as "admin"),
  ProductController.deleteProductById
);

export const ProductRoute = router;