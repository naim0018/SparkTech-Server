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
exports.ProductService = void 0;
const product_model_1 = __importDefault(require("./product.model"));
const addProductData = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield product_model_1.default.create(payload);
    return result;
});
const getAllProductData = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const { search, category, stockStatus, minPrice, maxPrice, sort, page = 1, limit = 12 } = query;
    let filter = {};
    // Add search filter
    if (search) {
        filter.$or = [
            { 'basicInfo.title': { $regex: search, $options: 'i' } },
            { 'basicInfo.category': { $regex: search, $options: 'i' } },
            { 'basicInfo.brand': { $regex: search, $options: 'i' } }
        ];
    }
    // Add category filter
    if (category) {
        filter['basicInfo.category'] = category;
    }
    // Add stock status filter
    if (stockStatus) {
        filter.stockStatus = stockStatus;
    }
    // Add price range filter
    if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice)
            filter.price.$gte = Number(minPrice);
        if (maxPrice)
            filter.price.$lte = Number(maxPrice);
    }
    const skip = (Number(page) - 1) * Number(limit);
    // Before the sort line, add type assertion for the sort key
    const sortKey = sort;
    const result = yield product_model_1.default
        .find(filter)
        .sort(sortKey ? { [sortKey]: 1 } : { createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));
    const total = yield product_model_1.default.countDocuments(filter);
    return {
        data: result,
        meta: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPage: Math.ceil(total / Number(limit))
        }
    };
});
const getProductByIdData = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield product_model_1.default.findById(id);
});
const updateProductDataById = (id, updateData) => __awaiter(void 0, void 0, void 0, function* () {
    return yield product_model_1.default.findByIdAndUpdate(id, updateData, { new: true });
});
const deleteProductDataById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield product_model_1.default.findByIdAndDelete(id);
});
const getProductsByCategory = (category, limit) => __awaiter(void 0, void 0, void 0, function* () {
    const products = yield product_model_1.default.find({
        'basicInfo.category': {
            $regex: new RegExp(category, 'i')
        }
    })
        .limit(limit)
        .sort({ createdAt: -1 });
    return products;
});
exports.ProductService = {
    addProductData,
    getAllProductData,
    getProductByIdData,
    updateProductDataById,
    deleteProductDataById,
    getProductsByCategory,
};
