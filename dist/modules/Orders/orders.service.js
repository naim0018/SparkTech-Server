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
// Helper to generate Unique Readable ID
const generateOrderId = (OrderModel) => __awaiter(void 0, void 0, void 0, function* () {
    const lastOrder = yield OrderModel.findOne({}, { orderId: 1 }).sort({ createdAt: -1 });
    let newId = 1001;
    if (lastOrder && lastOrder.orderId) {
        const parts = lastOrder.orderId.split('-');
        if (parts.length === 3)
            newId = parseInt(parts[2]) + 1;
    }
    const year = new Date().getFullYear();
    return `ORD-${year}-${newId}`;
});
// Helper to resolve unit price for a variant selection
const resolveSelectionUnitPrice = (selection, product, basePrice) => {
    var _a, _b;
    if (selection.price && selection.price > 0) {
        return selection.price;
    }
    const baseVariantName = (_a = product.price) === null || _a === void 0 ? void 0 : _a.baseVariantName;
    if (selection.value === baseVariantName) {
        return basePrice;
    }
    if (product.variants && product.variants.length > 0) {
        for (const group of product.variants) {
            const found = (_b = group.items) === null || _b === void 0 ? void 0 : _b.find((i) => i.value === selection.value);
            if (found && found.price && found.price > 0) {
                return found.price;
            }
        }
    }
    return basePrice;
};
const addOrderData = (req, payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const OrderModel = (0, getTenantModel_1.getTenantModel)(req, 'Order', orders_model_1.OrderSchema);
    const ProductModel = (0, getTenantModel_1.getTenantModel)(req, 'Product', product_model_1.ProductSchema);
    // Validate totals and prices for security
    let calculatedSubtotal = 0;
    let maxDeliveryChargeInside = 0;
    let maxDeliveryChargeOutside = 0;
    let hasFreeShipping = false;
    let hasFreeShippingInside = false;
    let hasFreeShippingOutside = false;
    let totalComboDiscount = 0;
    for (const item of payload.items) {
        const product = yield ProductModel.findById(item.product);
        if (!product)
            throw new Error(`Product ${item.product} not found`);
        // Determine base price
        let basePrice = product.price.discounted || product.price.regular;
        // Calculate item total using Split Variant Logic or Standard Unit Price Logic
        let itemTotalExcludingBulkDocs = 0;
        let variantsHaveQuantities = false;
        // Check if variants have explicit quantities
        if (item.selectedVariants) {
            for (const selections of Object.values(item.selectedVariants)) {
                const arr = Array.isArray(selections) ? selections : [selections];
                for (const s of arr) {
                    if (s.quantity && s.quantity > 0) {
                        variantsHaveQuantities = true;
                        break;
                    }
                }
                if (variantsHaveQuantities)
                    break;
            }
        }
        if (variantsHaveQuantities) {
            // SPLIT VARIANT LOGIC: Sum of (VariantPrice * VariantQty) + (RemainingQty * BasePrice)
            let totalVariantQty = 0;
            if (item.selectedVariants) {
                for (const [groupName, selections] of Object.entries(item.selectedVariants)) {
                    const selectionsArr = Array.isArray(selections) ? selections : [selections];
                    for (const selection of selectionsArr) {
                        const qty = selection.quantity || 0;
                        if (qty > 0) {
                            const confirmPrice = resolveSelectionUnitPrice(selection, product, basePrice);
                            itemTotalExcludingBulkDocs += confirmPrice * qty;
                            totalVariantQty += qty;
                        }
                    }
                }
            }
            // Handle remaining quantity (if any) that has no specific variant assigned
            if (item.quantity > totalVariantQty) {
                itemTotalExcludingBulkDocs += basePrice * (item.quantity - totalVariantQty);
            }
            // Set unit price for DB record as average
            item.price = itemTotalExcludingBulkDocs / item.quantity;
        }
        else {
            // STANDARD LOGIC: Unit Price = Base or Replacement Variant Price
            let unitPrice = basePrice;
            let selectedPrice = 0;
            if (item.selectedVariants) {
                for (const [groupName, selections] of Object.entries(item.selectedVariants)) {
                    const selectionsArr = Array.isArray(selections) ? selections : [selections];
                    for (const selection of selectionsArr) {
                        const confirmPrice = resolveSelectionUnitPrice(selection, product, basePrice);
                        if (confirmPrice !== basePrice) {
                            selectedPrice = confirmPrice;
                        }
                    }
                }
            }
            if (selectedPrice > 0) {
                unitPrice = selectedPrice;
            }
            item.price = item.price && item.price > 0 ? item.price : unitPrice;
            itemTotalExcludingBulkDocs = item.price * item.quantity;
        }
        const itemSubtotal = itemTotalExcludingBulkDocs;
        calculatedSubtotal += itemSubtotal;
        // Apply Combo/Bulk Pricing Logic (Matching Frontend)
        // Normalize comboPricing and bulkPricing into a single tiers array
        // Note: Backend Product interface might need to be checked for comboPricing existence
        // Assuming product object has specific fields, we merge them similarly to frontend
        const comboPricing = product.toObject().comboPricing || [];
        // Legacy Bulk Pricing Logic REMOVED per user request
        // We now strictly use comboPricing tiers
        if (comboPricing.length > 0) {
            // Collect selected variant values for this item
            const selectedVariantValues = [];
            if (item.selectedVariants) {
                for (const selections of Object.values(item.selectedVariants)) {
                    const selectionsArr = Array.isArray(selections) ? selections : [selections];
                    for (const selection of selectionsArr) {
                        selectedVariantValues.push(selection.value);
                    }
                }
            }
            // Filter comboPricing based on selected variants if variantValue is specified
            const applicableCombo = comboPricing.filter((tier) => {
                if (!tier.variantValue || tier.variantValue === "") {
                    return true;
                }
                return selectedVariantValues.includes(tier.variantValue);
            });
            // 1. Sort tiers by minQuantity descending
            const sortedTiers = [...applicableCombo].sort((a, b) => b.minQuantity - a.minQuantity);
            // 2. Find the first applicable tier
            const applicableTier = sortedTiers.find((tier) => item.quantity >= tier.minQuantity);
            if (applicableTier) {
                if (applicableTier.discountType === "free_delivery") {
                    hasFreeShipping = true;
                }
                else if (applicableTier.discountType === "free_delivery_inside") {
                    hasFreeShippingInside = true;
                }
                else if (applicableTier.discountType === "free_delivery_outside") {
                    hasFreeShippingOutside = true;
                }
                else {
                    let discountAmount = 0;
                    if (applicableTier.discountType === "per_product") {
                        discountAmount = applicableTier.discount * item.quantity;
                    }
                    else {
                        discountAmount = applicableTier.discount; // Total discount
                    }
                    // Ensure discount doesn't exceed total price
                    discountAmount = Math.min(discountAmount, itemSubtotal);
                    totalComboDiscount += discountAmount;
                }
            }
        }
        // Process Bundles for this product
        const bundles = product.toObject().bundles || [];
        if (bundles.length > 0) {
            const selectedVariantValues = [];
            if (item.selectedVariants) {
                for (const selections of Object.values(item.selectedVariants)) {
                    const selectionsArr = Array.isArray(selections) ? selections : [selections];
                    for (const selection of selectionsArr) {
                        selectedVariantValues.push(selection.value);
                    }
                }
            }
            for (const bundle of bundles) {
                const isBundleMatched = bundle.variants.every((vVal) => selectedVariantValues.includes(vVal));
                if (isBundleMatched) {
                    if (bundle.discountType === "free_delivery") {
                        hasFreeShipping = true;
                    }
                    else if (bundle.discountType === "free_delivery_inside") {
                        hasFreeShippingInside = true;
                    }
                    else if (bundle.discountType === "free_delivery_outside") {
                        hasFreeShippingOutside = true;
                    }
                    else {
                        let bundleDiscount = 0;
                        if (bundle.discountType === "percentage") {
                            let combinedPrice = 0;
                            for (const vVal of bundle.variants) {
                                let itemPrice = basePrice;
                                for (const group of product.variants || []) {
                                    const foundItem = group.items.find((i) => i.value === vVal);
                                    if ((foundItem === null || foundItem === void 0 ? void 0 : foundItem.price) && foundItem.price > 0) {
                                        itemPrice = foundItem.price;
                                    }
                                }
                                combinedPrice += itemPrice;
                            }
                            bundleDiscount = (combinedPrice * bundle.discount) / 100;
                        }
                        else {
                            bundleDiscount = bundle.discount;
                        }
                        bundleDiscount = Math.min(bundleDiscount, itemSubtotal);
                        totalComboDiscount += bundleDiscount;
                    }
                }
            }
        }
        // Track delivery charges
        if ((_a = product.additionalInfo) === null || _a === void 0 ? void 0 : _a.freeShipping)
            hasFreeShipping = true;
        maxDeliveryChargeInside = Math.max(maxDeliveryChargeInside, product.basicInfo.deliveryChargeInsideDhaka || 0);
        maxDeliveryChargeOutside = Math.max(maxDeliveryChargeOutside, product.basicInfo.deliveryChargeOutsideDhaka || 0);
    }
    // Calculate delivery
    let deliveryCharge = 0;
    const isDeliveryFree = hasFreeShipping ||
        (payload.courierCharge === 'insideDhaka' && hasFreeShippingInside) ||
        (payload.courierCharge === 'outsideDhaka' && hasFreeShippingOutside);
    if (!isDeliveryFree) {
        deliveryCharge = payload.courierCharge === 'insideDhaka'
            ? (maxDeliveryChargeInside || 80)
            : (maxDeliveryChargeOutside || 150);
    }
    // Apply discount (Coupon + Combo)
    const couponDiscount = payload.discount || 0;
    const totalDiscount = couponDiscount + totalComboDiscount;
    // Generate orderId
    const orderId = yield generateOrderId(OrderModel);
    // Set all required fields on payload
    payload.orderId = orderId;
    payload.subTotal = calculatedSubtotal;
    payload.totalDiscount = totalDiscount;
    payload.deliveryCharge = deliveryCharge;
    payload.totalAmount = calculatedSubtotal + deliveryCharge - totalDiscount;
    payload.status = payload.status || 'pending';
    payload.statusHistory = [{
            status: 'pending',
            date: new Date(),
            comment: 'Order placed successfully'
        }];
    payload.comboInfo = totalComboDiscount > 0
        ? `Total combo savings: ৳${totalComboDiscount}`
        : undefined;
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
            { orderId: { $regex: search, $options: 'i' } }, // NEW: Search by orderId
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
const trackOrderByOrderIdData = (req, orderId) => __awaiter(void 0, void 0, void 0, function* () {
    const OrderModel = (0, getTenantModel_1.getTenantModel)(req, 'Order', orders_model_1.OrderSchema);
    const result = yield OrderModel.findOne({ orderId: orderId })
        .populate("items.product", "basicInfo.title price bulkPricing basicInfo.description basicInfo.brand basicInfo.category basicInfo.subcategory variants images");
    return result;
});
exports.OrderService = {
    addOrderData,
    getAllOrdersData,
    getOrderByIdData,
    trackOrderByPhoneData,
    trackOrderByConsignmentIdData,
    trackOrderByOrderIdData,
    updateOrderDataById,
    deleteOrderDataById,
};
