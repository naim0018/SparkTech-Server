import express from "express";
import auth from "../../app/middleware/auth";
import { USER_ROLE } from "../User/user.constant";
import { CategoryController } from "./categories.controller";

const router = express.Router();

// Public routes for storefront browsing
router.get("/", CategoryController.getAllCategories);
router.get("/:id", CategoryController.getCategoryById);

// Admin-only category management routes
router.post("/", auth(USER_ROLE.ADMIN as "admin"), CategoryController.createCategory);
router.post(
  "/:categoryId/subcategories",
  auth(USER_ROLE.ADMIN as "admin"),
  CategoryController.createSubCategory
);
router.put("/reorder", auth(USER_ROLE.ADMIN as "admin"), CategoryController.updateCategoryOrder);
router.put("/:id", auth(USER_ROLE.ADMIN as "admin"), CategoryController.updateCategory);
router.put(
  "/:categoryId/subcategories/:subCategoryName",
  auth(USER_ROLE.ADMIN as "admin"),
  CategoryController.updateSubCategory
);
router.delete("/:id", auth(USER_ROLE.ADMIN as "admin"), CategoryController.deleteCategory);
router.delete(
  "/:categoryId/subcategories/:subCategoryName",
  auth(USER_ROLE.ADMIN as "admin"),
  CategoryController.deleteSubCategory
);

export const CategoryRoute = router;
