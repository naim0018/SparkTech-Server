"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cart_controller_1 = require("./cart.controller");
const validateRequest_1 = __importDefault(require("../../app/middleware/validateRequest"));
const cart_validation_1 = require("./cart.validation");
const router = (0, express_1.Router)();
router.post('/cart', (0, validateRequest_1.default)(cart_validation_1.validateCart.cartSchema), cart_controller_1.CartController.addToCart);
router.get('/cart', cart_controller_1.CartController.getCart);
router.get('/cart/:id', cart_controller_1.CartController.getCartItemById);
router.put('/cart/:id', (0, validateRequest_1.default)(cart_validation_1.validateCart.updateCartSchema), cart_controller_1.CartController.updateCartItemById);
router.delete('/cart/:id', cart_controller_1.CartController.removeCartItemById);
exports.default = router;
