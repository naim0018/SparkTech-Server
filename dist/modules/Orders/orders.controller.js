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
    const result = yield orders_service_1.OrderService.getAllOrdersData();
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: "Orders Fetched Successfully",
        data: result,
    });
}));
const createOrder = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield orders_service_1.OrderService.addOrderData(req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.CREATED,
        message: "Order Created Successfully",
        data: result,
    });
}));
const getOrderById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield orders_service_1.OrderService.getOrderByIdData(id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: "Order Fetched Successfully",
        data: result,
    });
}));
const trackOrder = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { phone, consignmentId } = req.query;
    let result;
    if (consignmentId) {
        result = yield orders_service_1.OrderService.trackOrderByConsignmentIdData(consignmentId);
        // Wrap single result in array to match frontend expectation if needed, or handle null
        // Frontend expects array for phone search, maybe single object for ID/Consignment?
        // Let's return as data. If frontend expects array for phone and object for others, we must be consistent.
        // The previous trackOrderByPhone returned `find()` result (Array).
        // `trackOrderByConsignmentIdData` uses `findOne` (Object).
        // Let's stick to what appropriate for each. Frontend handles it.
    }
    else {
        result = yield orders_service_1.OrderService.trackOrderByPhoneData(phone);
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
    const result = yield orders_service_1.OrderService.updateOrderDataById(id, req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: "Order Updated Successfully",
        data: result,
    });
}));
const deleteOrderById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield orders_service_1.OrderService.deleteOrderDataById(id);
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
