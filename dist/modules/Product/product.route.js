"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductRoute = void 0;
const express_1 = require("express");
const validateRequest_1 = __importDefault(require("../../app/middleware/validateRequest"));
const auth_1 = __importDefault(require("../../app/middleware/auth"));
const user_constant_1 = require("../User/user.constant");
const product_controller_1 = require("./product.controller");
const product_validation_1 = require("./product.validation");
const router = (0, express_1.Router)();
// Public routes
router.get("/", product_controller_1.ProductController.getAllProduct);
router.get("/new-arrivals", product_controller_1.ProductController.getNewArrivals);
router.get("/category/:category", product_controller_1.ProductController.getProductsByCategory);
router.get("/:id", product_controller_1.ProductController.getProductById);
// Admin-only routes
router.post("/add-product", (0, auth_1.default)(user_constant_1.USER_ROLE.ADMIN), (0, validateRequest_1.default)(product_validation_1.ProductZodValidation.productSchemaZod), product_controller_1.ProductController.addProduct);
router.patch("/:id/update-product", (0, auth_1.default)(user_constant_1.USER_ROLE.ADMIN), product_controller_1.ProductController.updateProductById);
router.delete("/:id/delete-product", (0, auth_1.default)(user_constant_1.USER_ROLE.ADMIN), product_controller_1.ProductController.deleteProductById);
exports.ProductRoute = router;
