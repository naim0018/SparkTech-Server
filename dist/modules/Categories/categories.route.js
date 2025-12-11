"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryRoute = void 0;
const express_1 = __importDefault(require("express"));
const categories_controller_1 = require("./categories.controller");
const router = express_1.default.Router();
router.post('/', categories_controller_1.CategoryController.createCategory);
router.post('/:categoryId/subcategories', categories_controller_1.CategoryController.createSubCategory);
router.get('/', categories_controller_1.CategoryController.getAllCategories);
router.get('/:id', categories_controller_1.CategoryController.getCategoryById);
router.put('/:id', categories_controller_1.CategoryController.updateCategory);
router.delete('/:id', categories_controller_1.CategoryController.deleteCategory);
router.delete('/:categoryId/subcategories/:subCategoryName', categories_controller_1.CategoryController.deleteSubCategory);
router.put('/reorder', categories_controller_1.CategoryController.updateCategoryOrder);
router.put('/:categoryId/subcategories/:subCategoryName', categories_controller_1.CategoryController.updateSubCategory);
exports.CategoryRoute = router;
