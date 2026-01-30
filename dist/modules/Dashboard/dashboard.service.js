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
exports.DashboardService = void 0;
const orders_model_1 = require("../Orders/orders.model");
const product_model_1 = require("../Product/product.model");
const getTenantModel_1 = require("../../app/utils/getTenantModel");
const getStats = (req) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    const OrderModel = (0, getTenantModel_1.getTenantModel)(req, 'Order', orders_model_1.OrderSchema);
    const ProductModel = (0, getTenantModel_1.getTenantModel)(req, 'Product', product_model_1.ProductSchema);
    const totalOrders = yield OrderModel.countDocuments();
    const totalProducts = yield ProductModel.countDocuments();
    // Aggregating general order stats by status
    const orderStats = yield OrderModel.aggregate([
        {
            $group: {
                _id: { $toLower: "$status" },
                count: { $sum: 1 },
                totalAmount: { $sum: { $toDouble: "$totalAmount" } }
            }
        }
    ]);
    const statsMap = {};
    orderStats.forEach(stat => {
        if (stat._id) {
            statsMap[stat._id] = { count: stat.count, totalAmount: stat.totalAmount };
        }
    });
    const totalSalesAmount = orderStats.reduce((sum, stat) => sum + stat.totalAmount, 0);
    const revenueAmount = ((_a = statsMap['completed']) === null || _a === void 0 ? void 0 : _a.totalAmount) || ((_b = statsMap['delivered']) === null || _b === void 0 ? void 0 : _b.totalAmount) || 0;
    const canceledAmount = ((_c = statsMap['cancelled']) === null || _c === void 0 ? void 0 : _c.totalAmount) || ((_d = statsMap['cancelled']) === null || _d === void 0 ? void 0 : _d.totalAmount) || 0;
    const deliveredCount = ((_e = statsMap['completed']) === null || _e === void 0 ? void 0 : _e.count) || ((_f = statsMap['delivered']) === null || _f === void 0 ? void 0 : _f.count) || 0;
    const processingCount = ((_g = statsMap['processing']) === null || _g === void 0 ? void 0 : _g.count) || 0;
    const canceledCount = ((_h = statsMap['cancelled']) === null || _h === void 0 ? void 0 : _h.count) || 0;
    // Monthly Sales & Revenue for Chart
    const monthlyStatsResult = yield OrderModel.aggregate([
        {
            $match: {
                createdAt: { $exists: true, $ne: null }
            }
        },
        {
            $group: {
                _id: {
                    month: { $month: "$createdAt" },
                    year: { $year: "$createdAt" }
                },
                sales: { $sum: { $toDouble: "$totalAmount" } },
                revenue: {
                    $sum: {
                        $cond: [
                            { $in: [{ $toLower: "$status" }, ["completed", "delivered"]] },
                            { $toDouble: "$totalAmount" },
                            0
                        ]
                    }
                },
                orders: { $sum: 1 }
            }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);
    // Sales Growth calculation
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;
    const currentMonthSales = ((_j = monthlyStatsResult.find(s => s._id.month === currentMonth && s._id.year === currentYear)) === null || _j === void 0 ? void 0 : _j.sales) || 0;
    const lastMonthSales = ((_k = monthlyStatsResult.find(s => s._id.month === lastMonth && s._id.year === lastMonthYear)) === null || _k === void 0 ? void 0 : _k.sales) || 0;
    let salesGrowth = 0;
    if (lastMonthSales > 0) {
        salesGrowth = ((currentMonthSales - lastMonthSales) / lastMonthSales) * 100;
    }
    else if (currentMonthSales > 0) {
        salesGrowth = 100;
    }
    // Recent Orders
    const recentOrdersRaw = yield OrderModel.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select('totalAmount status createdAt billingInformation');
    const pendingCount = ((_l = statsMap['pending']) === null || _l === void 0 ? void 0 : _l.count) || 0;
    const currentMonthOrders = ((_m = monthlyStatsResult.find(s => s._id.month === currentMonth && s._id.year === currentYear)) === null || _m === void 0 ? void 0 : _m.orders) || 0;
    return {
        overview: {
            totalOrders,
            totalProducts,
            totalSalesAmount,
            revenueAmount,
            canceledAmount,
            deliveredCount,
            processingCount,
            pendingCount,
            canceledCount,
            salesGrowth: Number(salesGrowth.toFixed(2)),
            currentMonthSales: currentMonthSales,
            currentMonthOrders: currentMonthOrders,
            lastOrder: recentOrdersRaw[0] || null
        },
        statusBreakdown: orderStats.map(s => ({
            status: s._id || 'unknown',
            count: s.count,
            amount: s.totalAmount
        })),
        monthlyStats: monthlyStatsResult.map(s => ({
            month: `${s._id.year}-${String(s._id.month).padStart(2, '0')}`,
            sales: s.sales,
            revenue: s.revenue,
            orders: s.orders
        })),
        recentOrders: recentOrdersRaw.map(order => {
            var _a;
            return ({
                _id: order._id,
                customerName: ((_a = order.billingInformation) === null || _a === void 0 ? void 0 : _a.name) || 'Unknown',
                amount: order.totalAmount,
                status: order.status,
                date: order.createdAt
            });
        })
    };
});
exports.DashboardService = {
    getStats
};
