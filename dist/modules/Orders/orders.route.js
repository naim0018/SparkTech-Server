"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderRoute = void 0;
const express_1 = require("express");
const validateRequest_1 = __importDefault(require("../../app/middleware/validateRequest"));
const orders_controller_1 = require("./orders.controller");
const orders_validation_1 = require("./orders.validation");
const router = (0, express_1.Router)();
router.get('/', orders_controller_1.OrderController.getAllOrders);
router.post('/create-order', (0, validateRequest_1.default)(orders_validation_1.OrderZodValidation.orderSchemaZod), orders_controller_1.OrderController.createOrder);
router.get('/:id', orders_controller_1.OrderController.getOrderById);
router.patch('/:id', (0, validateRequest_1.default)(orders_validation_1.OrderZodValidation.updateOrderSchemaZod.innerType()), orders_controller_1.OrderController.updateOrderById);
router.delete('/:id/delete-order', orders_controller_1.OrderController.deleteOrderById);
exports.OrderRoute = router;
