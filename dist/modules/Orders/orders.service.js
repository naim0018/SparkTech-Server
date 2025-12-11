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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const orders_model_1 = __importDefault(require("./orders.model"));
const addOrderData = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield orders_model_1.default.create(payload);
    return result;
});
const getAllOrdersData = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield orders_model_1.default.find().populate("items.product", "basicInfo.title basicInfo.price basicInfo.description basicInfo.brand basicInfo.category basicInfo.subcategory variants").sort({ createdAt: -1 });
    return result;
});
const getOrderByIdData = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield orders_model_1.default.findById(id).populate("items.product", "basicInfo.title basicInfo.price basicInfo.description basicInfo.brand basicInfo.category basicInfo.subcategory variants");
    return result;
});
const updateOrderDataById = (id, updateData) => __awaiter(void 0, void 0, void 0, function* () {
    return yield orders_model_1.default.findByIdAndUpdate(id, updateData, {
        new: true,
    }).populate("items.product");
});
const deleteOrderDataById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield orders_model_1.default.findByIdAndDelete(id);
});
exports.OrderService = {
    addOrderData,
    getAllOrdersData,
    getOrderByIdData,
    updateOrderDataById,
    deleteOrderDataById,
};
