"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductRoute = void 0;
const express_1 = require("express");
const validateRequest_1 = __importDefault(require("../../app/middleware/validateRequest"));
const product_controller_1 = require("./product.controller");
const product_validation_1 = require("./product.validation");
const router = (0, express_1.Router)();
router.get('/', product_controller_1.ProductController.getAllProduct);
router.post('/add-product', (0, validateRequest_1.default)(product_validation_1.ProductZodValidation.productSchemaZod), product_controller_1.ProductController.addProduct);
router.get("/:id", product_controller_1.ProductController.getProductById);
router.patch("/:id/update-product", product_controller_1.ProductController.updateProductById);
router.delete("/:id/delete-product", product_controller_1.ProductController.deleteProductById);
router.get('/category/:category', product_controller_1.ProductController.getProductsByCategory);
exports.ProductRoute = router;
