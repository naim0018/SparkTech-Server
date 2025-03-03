import express from "express";
import { CategoryController } from "./categories.controller";

const router = express.Router();

router.post('/', CategoryController.createCategory);
router.post('/:categoryId/subcategories', CategoryController.createSubCategory);
router.get('/', CategoryController.getAllCategories);
router.get('/:id', CategoryController.getCategoryById);
router.put('/:id', CategoryController.updateCategory);
router.delete('/:id', CategoryController.deleteCategory);
router.delete('/:categoryId/subcategories/:subCategoryName', CategoryController.deleteSubCategory);
router.put('/reorder', CategoryController.updateCategoryOrder);
router.put('/:categoryId/subcategories/:subCategoryName', CategoryController.updateSubCategory);

export const CategoryRoute = router;  
