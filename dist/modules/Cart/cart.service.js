"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartService = void 0;
const cart_model_1 = require("./cart.model");
const getTenantModel_1 = require("../../app/utils/getTenantModel");
const addToCartData = (req, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const CartModel = (0, getTenantModel_1.getTenantModel)(req, 'Cart', cart_model_1.CartSchema);
    const result = yield CartModel.create(payload);
    return result;
});
const getCartData = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const CartModel = (0, getTenantModel_1.getTenantModel)(req, 'Cart', cart_model_1.CartSchema);
    const result = yield CartModel.find();
    return result;
});
const getCartItemByIdData = (req, id) => __awaiter(void 0, void 0, void 0, function* () {
    const CartModel = (0, getTenantModel_1.getTenantModel)(req, 'Cart', cart_model_1.CartSchema);
    return yield CartModel.findById(id);
});
const updateCartItemDataById = (req, id, updateData) => __awaiter(void 0, void 0, void 0, function* () {
    const CartModel = (0, getTenantModel_1.getTenantModel)(req, 'Cart', cart_model_1.CartSchema);
    return yield CartModel.findByIdAndUpdate(id, updateData, { new: true });
});
const removeCartItemDataById = (req, id) => __awaiter(void 0, void 0, void 0, function* () {
    const CartModel = (0, getTenantModel_1.getTenantModel)(req, 'Cart', cart_model_1.CartSchema);
    return yield CartModel.findByIdAndDelete(id);
});
exports.CartService = {
    addToCartData,
    getCartData,
    getCartItemByIdData,
    updateCartItemDataById,
    removeCartItemDataById,
};
