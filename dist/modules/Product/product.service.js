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
exports.ProductService = void 0;
const product_model_1 = require("./product.model");
const addProductData = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield product_model_1.ProductModel.create(payload);
    return result;
});
const getAllProductData = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield product_model_1.ProductModel.find();
    return result;
});
const getProductByIdData = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield product_model_1.ProductModel.findById(id);
});
const updateProductDataById = (id, updateData) => __awaiter(void 0, void 0, void 0, function* () {
    return yield product_model_1.ProductModel.findByIdAndUpdate(id, updateData, { new: true });
});
const deleteProductDataById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield product_model_1.ProductModel.findByIdAndDelete(id);
});
exports.ProductService = {
    addProductData,
    getAllProductData,
    getProductByIdData,
    updateProductDataById,
    deleteProductDataById,
};
