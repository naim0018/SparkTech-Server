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
const orders_model_1 = require("../Orders/orders.model");
const getTenantModel_1 = require("../../app/utils/getTenantModel");
const BASE_URL = "https://portal.packzy.com/api/v1";
const getHeaders = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const Tracking = (0, getTenantModel_1.getTenantModel)(req, 'Tracking', tracking_model_1.trackingSchema);
    const settings = yield Tracking.findOne();
    if (!settings || !settings.steadfastApiKey || !settings.steadfastSecretKey) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Steadfast Courier credentials not found");
    }
    return {
        "Content-Type": "application/json",
        "Api-Key": settings.steadfastApiKey,
        "Secret-Key": settings.steadfastSecretKey,
    };
});
const createOrder = (req, orderData) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g;
    const headers = yield getHeaders(req);
    const OrderModel = (0, getTenantModel_1.getTenantModel)(req, 'Order', orders_model_1.OrderSchema);
    // If orderId is provided, we fetch and update the local order
    // Expecting orderData to contain either full payload OR just an { orderId } to build payload from
    let payload = orderData;
    let localOrder = null;
    if (orderData.orderId && !orderData.invoice) {
        // It's a request to process a local order by ID
        localOrder = yield OrderModel.findById(orderData.orderId);
        if (!localOrder) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Order not found");
        }
        payload = {
            invoice: localOrder.orderId || localOrder._id.toString(), // Use orderId (human-readable) with fallback
            recipient_name: localOrder.billingInformation.name,
            recipient_phone: localOrder.billingInformation.phone,
            recipient_address: localOrder.billingInformation.address,
            cod_amount: localOrder.totalAmount,
            note: localOrder.billingInformation.notes || "Handle with care",
        };
    }
    try {
        const response = yield axios_1.default.post(`${BASE_URL}/create_order`, payload, { headers });
        if (response.data.status !== 200) {
            const errorMsg = response.data.errors
                ? Object.entries(response.data.errors).map(([k, v]) => `${k}: ${v}`).join(', ')
                : (response.data.message || "Failed to create order in Steadfast");
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, errorMsg);
        }
        // Auto-update local order if we have one
        if (localOrder && ((_b = (_a = response.data) === null || _a === void 0 ? void 0 : _a.consignment) === null || _b === void 0 ? void 0 : _b.consignment_id)) {
            const updatePayload = {
                consignment_id: response.data.consignment.consignment_id
            };
            // User asked to update the delivery status according to the steadfast.
            // Steadfast initial status is usually 'in_review' or 'pending'.
            if ((_d = (_c = response.data) === null || _c === void 0 ? void 0 : _c.consignment) === null || _d === void 0 ? void 0 : _d.status) {
                updatePayload.status = response.data.consignment.status;
            }
            // Use findByIdAndUpdate to avoid validation errors on unrelated fields (e.g. courierCharge)
            yield OrderModel.findByIdAndUpdate(localOrder._id, updatePayload);
        }
        return response.data;
    }
    catch (error) {
        if (error instanceof AppError_1.default)
            throw error;
        const statusCode = ((_e = error.response) === null || _e === void 0 ? void 0 : _e.status) || http_status_1.default.BAD_REQUEST;
        const message = ((_g = (_f = error.response) === null || _f === void 0 ? void 0 : _f.data) === null || _g === void 0 ? void 0 : _g.message) || error.message || "Failed to create order in Steadfast";
        throw new AppError_1.default(statusCode, message);
    }
});
const bulkCreateOrder = (req, orders) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const headers = yield getHeaders(req);
    try {
        const response = yield axios_1.default.post(`${BASE_URL}/create_order/bulk-order`, { data: orders }, { headers });
        if (response.data.status !== 200) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, response.data.message || "Failed to create bulk orders in Steadfast");
        }
        return response.data;
    }
    catch (error) {
        if (error instanceof AppError_1.default)
            throw error;
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || error.message || "Failed to create bulk orders in Steadfast");
    }
});
const checkDeliveryStatus = (req, consignmentId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const headers = yield getHeaders(req);
    const OrderModel = (0, getTenantModel_1.getTenantModel)(req, 'Order', orders_model_1.OrderSchema);
    try {
        const response = yield axios_1.default.get(`${BASE_URL}/status_by_cid/${consignmentId}`, { headers });
        if (response.data.status !== 200) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, response.data.message || "Failed to fetch delivery status");
        }
        const data = response.data;
        // Sync status with local order if available
        if (data === null || data === void 0 ? void 0 : data.delivery_status) {
            yield OrderModel.findOneAndUpdate({ consignment_id: consignmentId }, { status: data.delivery_status });
        }
        return data;
    }
    catch (error) {
        if (error instanceof AppError_1.default)
            throw error;
        const statusCode = ((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) || http_status_1.default.BAD_REQUEST;
        const message = ((_c = (_b = error.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.message) || error.message || "Failed to fetch delivery status";
        throw new AppError_1.default(statusCode, message);
    }
});
const bulkCheckDeliveryStatus = (req, consignmentIds) => __awaiter(void 0, void 0, void 0, function* () {
    if (!consignmentIds || consignmentIds.length === 0)
        return [];
    // Use Promise.allSettled to handle individual failures without failing the whole request
    const results = yield Promise.allSettled(consignmentIds.map((id) => checkDeliveryStatus(req, id)));
    return results.map((result, index) => ({
        consignment_id: consignmentIds[index],
        status: result.status === 'fulfilled' ? 'success' : 'failed',
        data: result.status === 'fulfilled' ? result.value : null,
        error: result.status === 'rejected' ? result.reason : null
    }));
});
const getCurrentBalance = (req) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const headers = yield getHeaders(req);
    try {
        const response = yield axios_1.default.get(`${BASE_URL}/current_balance`, { headers });
        return response.data;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || "Failed to fetch current balance");
    }
});
const getReturnRequests = (req, params) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const headers = yield getHeaders(req);
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
const getPoliceStations = (req) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    // "Get Policestations" - Assuming endpoint /police_stations or similar utility
    // If auth is not required for public utility, we might relax headers, but usually keys are needed
    const headers = yield getHeaders(req);
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
    bulkCheckDeliveryStatus,
    getCurrentBalance,
    getReturnRequests,
    getPoliceStations
};
