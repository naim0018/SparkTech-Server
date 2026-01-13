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
exports.SteadfastService = void 0;
const axios_1 = __importDefault(require("axios"));
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../app/error/AppError"));
const tracking_model_1 = require("../TrackingIntegrations/tracking.model");
const orders_model_1 = __importDefault(require("../Orders/orders.model"));
const BASE_URL = "https://portal.steadfast.com.bd/api/v1";
const getHeaders = () => __awaiter(void 0, void 0, void 0, function* () {
    const settings = yield tracking_model_1.Tracking.findOne();
    if (!settings || !settings.steadfastApiKey || !settings.steadfastSecretKey) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Steadfast Courier credentials not found");
    }
    return {
        "Content-Type": "application/json",
        "Api-Key": settings.steadfastApiKey,
        "Secret-Key": settings.steadfastSecretKey,
    };
});
const createOrder = (orderData) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    const headers = yield getHeaders();
    // If orderId is provided, we fetch and update the local order
    // Expecting orderData to contain either full payload OR just an { orderId } to build payload from
    let payload = orderData;
    let localOrder = null;
    if (orderData.orderId && !orderData.invoice) {
        // It's a request to process a local order by ID
        localOrder = yield orders_model_1.default.findById(orderData.orderId);
        if (!localOrder) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Order not found");
        }
        payload = {
            invoice: localOrder._id.toString(),
            recipient_name: localOrder.billingInformation.name,
            recipient_phone: localOrder.billingInformation.phone,
            recipient_address: localOrder.billingInformation.address,
            cod_amount: ((_a = localOrder.paymentInfo) === null || _a === void 0 ? void 0 : _a.paymentMethod) === 'cash on delivery' ? localOrder.totalAmount : 0,
            note: localOrder.billingInformation.notes || "Handle with care",
        };
    }
    try {
        const response = yield axios_1.default.post(`${BASE_URL}/create_order`, payload, { headers });
        // Auto-update local order if we have one
        if (localOrder && ((_c = (_b = response.data) === null || _b === void 0 ? void 0 : _b.consignment) === null || _c === void 0 ? void 0 : _c.consignment_id)) {
            localOrder.consignment_id = response.data.consignment.consignment_id;
            // Map Steadfast status to local status if needed, or just keep as is until webhook/status check
            // Usually creation implies 'Processing' or 'Shipped' depending on workflow. 
            // User asked for "steadfast order status automaticaly update on the site". 
            // Initial status from Steadfast is usually 'pending' (in their system).
            // Let's set local status to 'Start With Courier' -> maybe just 'Processing' or 'Shipped'?
            // Existing enums: ['pending', 'processing', 'shipped', 'completed', 'cancelled']
            // Let's move to 'shipped' if it was pending/processing
            if (localOrder.status === 'pending' || localOrder.status === 'processing') {
                localOrder.status = 'shipped';
            }
            yield localOrder.save();
        }
        return response.data;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, ((_e = (_d = error.response) === null || _d === void 0 ? void 0 : _d.data) === null || _e === void 0 ? void 0 : _e.message) || "Failed to create order in Steadfast");
    }
});
const bulkCreateOrder = (orders) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const headers = yield getHeaders();
    try {
        const response = yield axios_1.default.post(`${BASE_URL}/create_order/bulk-order`, { data: orders }, { headers });
        return response.data;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || "Failed to create bulk orders in Steadfast");
    }
});
const checkDeliveryStatus = (consignmentId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const headers = yield getHeaders();
    try {
        const response = yield axios_1.default.get(`${BASE_URL}/status_by_cid/${consignmentId}`, { headers });
        return response.data;
    }
    catch (error) {
        if (((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) === 404) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Consignment ID not found");
        }
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, ((_c = (_b = error.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.message) || "Failed to fetch delivery status");
    }
});
const getCurrentBalance = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const headers = yield getHeaders();
    try {
        const response = yield axios_1.default.get(`${BASE_URL}/current_balance`, { headers });
        return response.data;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || "Failed to fetch current balance");
    }
});
const getReturnRequests = (params) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const headers = yield getHeaders();
    try {
        // Based on documentation provided in context request: "Get Return Requests"
        // Usually straightforward GET with optional query params
        const response = yield axios_1.default.get(`${BASE_URL}/return_requests`, { headers, params });
        return response.data;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || "Failed to fetch return requests");
    }
});
const getPoliceStations = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    // "Get Policestations" - Assuming endpoint /police_stations or similar utility
    // If auth is not required for public utility, we might relax headers, but usually keys are needed
    const headers = yield getHeaders();
    try {
        const response = yield axios_1.default.get(`${BASE_URL}/police_stations`, { headers });
        return response.data;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || "Failed to fetch police stations");
    }
});
exports.SteadfastService = {
    createOrder,
    bulkCreateOrder,
    checkDeliveryStatus,
    getCurrentBalance,
    getReturnRequests,
    getPoliceStations
};
