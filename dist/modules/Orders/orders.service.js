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
exports.OrderService = void 0;
const orders_model_1 = require("./orders.model");
const product_model_1 = require("../Product/product.model");
const getTenantModel_1 = require("../../app/utils/getTenantModel");
const addOrderData = (req, payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const OrderModel = (0, getTenantModel_1.getTenantModel)(req, 'Order', orders_model_1.OrderSchema);
    const ProductModel = (0, getTenantModel_1.getTenantModel)(req, 'Product', product_model_1.ProductSchema);
    // Validate totals and prices for security
    let calculatedSubtotal = 0;
    let maxDeliveryChargeInside = 0;
    let maxDeliveryChargeOutside = 0;
    let hasFreeShipping = false;
    for (const item of payload.items) {
        const product = yield ProductModel.findById(item.product);
        if (!product)
            throw new Error(`Product ${item.product} not found`);
        // Determine base price
        let basePrice = product.price.discounted || product.price.regular;
        // Apply bulk pricing
        if (product.bulkPricing && product.bulkPricing.length > 0) {
            const sortedBulk = [...product.bulkPricing].sort((a, b) => b.minQuantity - a.minQuantity);
            const tier = sortedBulk.find((t) => item.quantity >= t.minQuantity);
            if (tier) {
                basePrice = tier.price;
            }
        }
        // Add variant prices
        let unitPrice = basePrice;
        if (item.selectedVariants) {
            for (const [groupName, selection] of Object.entries(item.selectedVariants)) {
                const variantGroup = (_a = product.variants) === null || _a === void 0 ? void 0 : _a.find((v) => v.group === groupName);
                const variantItem = variantGroup === null || variantGroup === void 0 ? void 0 : variantGroup.items.find((i) => i.value === selection.value);
                if (variantItem === null || variantItem === void 0 ? void 0 : variantItem.price) {
                    unitPrice += variantItem.price;
                }
            }
        }
        // Force the price in the payload to match DB reality
        item.price = unitPrice;
        calculatedSubtotal += unitPrice * item.quantity;
        // Track delivery charges
        if ((_b = product.additionalInfo) === null || _b === void 0 ? void 0 : _b.freeShipping)
            hasFreeShipping = true;
        maxDeliveryChargeInside = Math.max(maxDeliveryChargeInside, product.basicInfo.deliveryChargeInsideDhaka || 0);
        maxDeliveryChargeOutside = Math.max(maxDeliveryChargeOutside, product.basicInfo.deliveryChargeOutsideDhaka || 0);
    }
    // Calculate delivery
    let deliveryCharge = 0;
    if (!hasFreeShipping) {
        deliveryCharge = payload.courierCharge === 'insideDhaka' ? (maxDeliveryChargeInside || 80) : (maxDeliveryChargeOutside || 150);
    }
    // Apply discount if any (trusting for now or could validate coupons)
    const discount = payload.discount || 0;
    // Final validation of totalAmount
    payload.totalAmount = calculatedSubtotal + deliveryCharge - discount;
    const result = yield OrderModel.create(payload);
    return result;
});
const getAllOrdersData = (req, query) => __awaiter(void 0, void 0, void 0, function* () {
    const OrderModel = (0, getTenantModel_1.getTenantModel)(req, 'Order', orders_model_1.OrderSchema);
    const { search, status, sort, order, page = 1, limit = 10 } = query;
    let filter = {};
    if (search) {
        filter.$or = [
            { 'billingInformation.name': { $regex: search, $options: 'i' } },
            { 'billingInformation.phone': { $regex: search, $options: 'i' } },
            { consignment_id: { $regex: search, $options: 'i' } },
        ];
        // Check if search looks like a valid MongoDB ObjectId
        if (typeof search === 'string' && /^[0-9a-fA-F]{24}$/.test(search)) {
            filter.$or.push({ _id: search });
        }
    }
    if (status && status !== 'all') {
        filter.status = { $regex: `^${status}$`, $options: 'i' };
    }
    const skip = (Number(page) - 1) * Number(limit);
    let sortCriteria = { createdAt: -1 };
    if (sort) {
        sortCriteria = { [sort]: order === 'asc' ? 1 : -1 };
    }
    const result = yield OrderModel
        .find(filter)
        .populate("items.product", "basicInfo.title price bulkPricing basicInfo.description basicInfo.brand basicInfo.category basicInfo.subcategory variants images")
        .sort(sortCriteria)
        .skip(skip)
        .limit(Number(limit));
    const total = yield OrderModel.countDocuments(filter);
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
const getOrderByIdData = (req, id) => __awaiter(void 0, void 0, void 0, function* () {
    const OrderModel = (0, getTenantModel_1.getTenantModel)(req, 'Order', orders_model_1.OrderSchema);
    const result = yield OrderModel.findById(id).populate("items.product", "basicInfo.title price bulkPricing basicInfo.description basicInfo.brand basicInfo.category basicInfo.subcategory variants images");
    return result;
});
const updateOrderDataById = (req, id, updateData) => __awaiter(void 0, void 0, void 0, function* () {
    const OrderModel = (0, getTenantModel_1.getTenantModel)(req, 'Order', orders_model_1.OrderSchema);
    return yield OrderModel.findByIdAndUpdate(id, updateData, {
        new: true,
    }).populate("items.product");
});
const deleteOrderDataById = (req, id) => __awaiter(void 0, void 0, void 0, function* () {
    const OrderModel = (0, getTenantModel_1.getTenantModel)(req, 'Order', orders_model_1.OrderSchema);
    return yield OrderModel.findByIdAndDelete(id);
});
const trackOrderByPhoneData = (req, phone) => __awaiter(void 0, void 0, void 0, function* () {
    const OrderModel = (0, getTenantModel_1.getTenantModel)(req, 'Order', orders_model_1.OrderSchema);
    const result = yield OrderModel.find({ "billingInformation.phone": phone })
        .populate("items.product", "basicInfo.title price bulkPricing basicInfo.description basicInfo.brand basicInfo.category basicInfo.subcategory variants images")
        .sort({ createdAt: -1 });
    return result;
});
const trackOrderByConsignmentIdData = (req, consignmentId) => __awaiter(void 0, void 0, void 0, function* () {
    const OrderModel = (0, getTenantModel_1.getTenantModel)(req, 'Order', orders_model_1.OrderSchema);
    const result = yield OrderModel.findOne({ consignment_id: consignmentId })
        .populate("items.product", "basicInfo.title price bulkPricing basicInfo.description basicInfo.brand basicInfo.category basicInfo.subcategory variants images");
    return result;
});
exports.OrderService = {
    addOrderData,
    getAllOrdersData,
    getOrderByIdData,
    trackOrderByPhoneData,
    trackOrderByConsignmentIdData,
    updateOrderDataById,
    deleteOrderDataById,
};
