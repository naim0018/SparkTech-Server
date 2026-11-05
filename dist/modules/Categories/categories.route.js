"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryRoute = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../app/middleware/auth"));
const user_constant_1 = require("../User/user.constant");
const categories_controller_1 = require("./categories.controller");
const router = express_1.default.Router();
// Public routes for storefront browsing
router.get("/", categories_controller_1.CategoryController.getAllCategories);
router.get("/:id", categories_controller_1.CategoryController.getCategoryById);
// Admin-only category management routes
router.post("/", (0, auth_1.default)(user_constant_1.USER_ROLE.ADMIN), categories_controller_1.CategoryController.createCategory);
router.post("/:categoryId/subcategories", (0, auth_1.default)(user_constant_1.USER_ROLE.ADMIN), categories_controller_1.CategoryController.createSubCategory);
router.put("/reorder", (0, auth_1.default)(user_constant_1.USER_ROLE.ADMIN), categories_controller_1.CategoryController.updateCategoryOrder);
router.put("/:id", (0, auth_1.default)(user_constant_1.USER_ROLE.ADMIN), categories_controller_1.CategoryController.updateCategory);
router.put("/:categoryId/subcategories/:subCategoryName", (0, auth_1.default)(user_constant_1.USER_ROLE.ADMIN), categories_controller_1.CategoryController.updateSubCategory);
router.delete("/:id", (0, auth_1.default)(user_constant_1.USER_ROLE.ADMIN), categories_controller_1.CategoryController.deleteCategory);
router.delete("/:categoryId/subcategories/:subCategoryName", (0, auth_1.default)(user_constant_1.USER_ROLE.ADMIN), categories_controller_1.CategoryController.deleteSubCategory);
exports.CategoryRoute = router;
