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
exports.UserDashboardService = void 0;
const orders_model_1 = require("../Orders/orders.model");
const getTenantModel_1 = require("../../app/utils/getTenantModel");
const getUserDashboardStats = (req, phone) => __awaiter(void 0, void 0, void 0, function* () {
    const OrderModel = (0, getTenantModel_1.getTenantModel)(req, 'Order', orders_model_1.OrderSchema);
    // Get all orders for this phone number
    const orders = yield OrderModel.find({ "billingInformation.phone": phone }).sort({ createdAt: -1 });
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + (Number(order.totalAmount) || 0), 0);
    // Status breakdown
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const deliveredOrders = orders.filter(o => o.status === 'delivered' || o.status === 'completed').length;
    const processingOrders = orders.filter(o => o.status === 'processing').length;
    const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;
    return {
        overview: {
            totalOrders,
            totalSpent,
            pendingOrders,
            deliveredOrders,
            processingOrders,
            cancelledOrders
        },
        orders: orders.map(order => ({
            _id: order._id,
            date: order.createdAt,
            totalAmount: order.totalAmount,
            status: order.status,
            itemsCount: order.items.length
        }))
    };
});
exports.UserDashboardService = {
    getUserDashboardStats
};
