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
const getTenantModel_1 = require("../../app/utils/getTenantModel");
const addProductData = (req, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const ProductModel = (0, getTenantModel_1.getTenantModel)(req, "Product", product_model_1.ProductSchema);
    const result = yield ProductModel.create(payload);
    return result;
});
const getAllProductData = (req, query) => __awaiter(void 0, void 0, void 0, function* () {
    const ProductModel = (0, getTenantModel_1.getTenantModel)(req, "Product", product_model_1.ProductSchema);
    const { search, category, stockStatus, minPrice, maxPrice, rating, sort, page = 1, limit = 12, } = query;
    let filter = {};
    // Add search filter
    if (search) {
        filter.$or = [
            { "basicInfo.title": { $regex: search, $options: "i" } },
            { "basicInfo.category": { $regex: search, $options: "i" } },
        ];
    }
    // Add category filter
    if (category) {
        filter["basicInfo.category"] = { $regex: new RegExp(`^${category}$`, "i") };
    }
    // Add stock status filter
    if (stockStatus) {
        filter.stockStatus = stockStatus;
    }
    // Add price range filter
    if (minPrice || maxPrice) {
        if (minPrice)
            filter["price.regular"] = Object.assign(Object.assign({}, filter["price.regular"]), { $gte: Number(minPrice) });
        if (maxPrice)
            filter["price.regular"] = Object.assign(Object.assign({}, filter["price.regular"]), { $lte: Number(maxPrice) });
    }
    // Add rating filter
    if (rating && Number(rating) > 0) {
        filter["rating.average"] = { $gte: Number(rating) };
    }
    const skip = (Number(page) - 1) * Number(limit);
    // Before the sort line, add type assertion for the sort key
    const result = yield ProductModel.find(filter)
        .sort(sort ? sort : "-createdAt")
        .skip(skip)
        .limit(Number(limit));
    const total = yield ProductModel.countDocuments(filter);
    return {
        data: result,
        meta: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPage: Math.ceil(total / Number(limit)),
        },
    };
});
const getProductByIdData = (req, id) => __awaiter(void 0, void 0, void 0, function* () {
    const ProductModel = (0, getTenantModel_1.getTenantModel)(req, "Product", product_model_1.ProductSchema);
    return yield ProductModel.findById(id);
});
const updateProductDataById = (req, id, updateData) => __awaiter(void 0, void 0, void 0, function* () {
    const ProductModel = (0, getTenantModel_1.getTenantModel)(req, "Product", product_model_1.ProductSchema);
    return yield ProductModel.findByIdAndUpdate(id, updateData, { new: true });
});
const deleteProductDataById = (req, id) => __awaiter(void 0, void 0, void 0, function* () {
    const ProductModel = (0, getTenantModel_1.getTenantModel)(req, "Product", product_model_1.ProductSchema);
    return yield ProductModel.findByIdAndDelete(id);
});
const getNewArrivalsData = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const ProductModel = (0, getTenantModel_1.getTenantModel)(req, "Product", product_model_1.ProductSchema);
    // 1. Get up to 2 latest products with combo pricing
    const comboProducts = yield ProductModel.find({
        comboPricing: { $exists: true, $not: { $size: 0 } },
    })
        .sort({ createdAt: -1 })
        .limit(2);
    const comboIds = comboProducts.map((p) => p._id);
    // 2. Get the latest products excluding the picked combo products to fill 8 slots
    const latestProducts = yield ProductModel.find({
        _id: { $nin: comboIds },
    })
        .sort({ createdAt: -1 })
        .limit(8);
    // 3. Assemble the 8 products
    // Indices 0 and 4 are for the "Large" cards (ideally combo products)
    const result = new Array(8).fill(null);
    let latestIdx = 0;
    // Place first combo product at index 0
    if (comboProducts.length > 0) {
        result[0] = comboProducts[0];
    }
    else if (latestProducts[latestIdx]) {
        result[0] = latestProducts[latestIdx++];
    }
    // Place second combo product at index 4
    if (comboProducts.length > 1) {
        result[4] = comboProducts[1];
    }
    else if (latestProducts[latestIdx]) {
        result[4] = latestProducts[latestIdx++];
    }
    // Fill the remaining slots
    for (let i = 0; i < 8; i++) {
        if (result[i] === null && latestProducts[latestIdx]) {
            result[i] = latestProducts[latestIdx++];
        }
    }
    // Filter out any remaining nulls if there were fewer than 8 products total
    return result.filter((p) => p !== null);
});
const getProductsByCategory = (req, category, limit) => __awaiter(void 0, void 0, void 0, function* () {
    const ProductModel = (0, getTenantModel_1.getTenantModel)(req, "Product", product_model_1.ProductSchema);
    const products = yield ProductModel.find({
        "basicInfo.category": {
            $regex: new RegExp(category, "i"),
        },
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
    getNewArrivalsData,
};
