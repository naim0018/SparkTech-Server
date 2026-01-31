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
exports.OrderController = void 0;
const http_status_codes_1 = require("http-status-codes");
const catchAsync_1 = __importDefault(require("../../app/utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../app/utils/sendResponse"));
const orders_service_1 = require("./orders.service");
const getAllOrders = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield orders_service_1.OrderService.getAllOrdersData(req, req.query);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: "Orders Fetched Successfully",
        data: result.data,
        meta: result.meta,
    });
}));
const createOrder = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield orders_service_1.OrderService.addOrderData(req, req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.CREATED,
        message: "Order Created Successfully",
        data: result,
    });
}));
const getOrderById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield orders_service_1.OrderService.getOrderByIdData(req, id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: "Order Fetched Successfully",
        data: result,
    });
}));
const trackOrder = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { phone, consignmentId, orderId } = req.query;
    let result = [];
    if (orderId) {
        const order = yield orders_service_1.OrderService.getOrderByIdData(req, orderId);
        result = order ? [order] : [];
    }
    else if (consignmentId) {
        const order = yield orders_service_1.OrderService.trackOrderByConsignmentIdData(req, consignmentId);
        result = order ? [order] : [];
    }
    else if (phone) {
        result = yield orders_service_1.OrderService.trackOrderByPhoneData(req, phone);
    }
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: "Order(s) Fetched Successfully",
        data: result,
    });
}));
const updateOrderById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield orders_service_1.OrderService.updateOrderDataById(req, id, req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: "Order Updated Successfully",
        data: result,
    });
}));
const deleteOrderById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield orders_service_1.OrderService.deleteOrderDataById(req, id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: "Order Deleted Successfully",
        data: result,
    });
}));
exports.OrderController = {
    getAllOrders,
    createOrder,
    getOrderById,
    trackOrder,
    updateOrderById,
    deleteOrderById
};
