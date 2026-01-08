import OrderModel from "../Orders/orders.model";
import ProductModel from "../Product/product.model";

const getStats = async () => {
    const totalOrders = await OrderModel.countDocuments();
    const totalProducts = await ProductModel.countDocuments();

    // Aggregating general order stats by status
    const orderStats = await OrderModel.aggregate([
        {
            $group: {
                _id: { $toLower: "$status" },
                count: { $sum: 1 },
                totalAmount: { $sum: { $toDouble: "$totalAmount" } }
            }
        }
    ]);

    const statsMap: Record<string, { count: number; totalAmount: number }> = {};
    orderStats.forEach(stat => {
        if (stat._id) {
            statsMap[stat._id] = { count: stat.count, totalAmount: stat.totalAmount };
        }
    });

    const totalSalesAmount = orderStats.reduce((sum, stat) => sum + stat.totalAmount, 0);
    const revenueAmount = statsMap['completed']?.totalAmount || statsMap['delivered']?.totalAmount || 0;
    const canceledAmount = statsMap['cancelled']?.totalAmount || statsMap['cancelled']?.totalAmount || 0;
    const deliveredCount = statsMap['completed']?.count || statsMap['delivered']?.count || 0;
    const processingCount = statsMap['processing']?.count || 0;
    const canceledCount = statsMap['cancelled']?.count || 0;

    // Monthly Sales & Revenue for Chart
    const monthlyStatsResult = await OrderModel.aggregate([
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

    const currentMonthSales = monthlyStatsResult.find(s => s._id.month === currentMonth && s._id.year === currentYear)?.sales || 0;
    const lastMonthSales = monthlyStatsResult.find(s => s._id.month === lastMonth && s._id.year === lastMonthYear)?.sales || 0;

    let salesGrowth = 0;
    if (lastMonthSales > 0) {
        salesGrowth = ((currentMonthSales - lastMonthSales) / lastMonthSales) * 100;
    } else if (currentMonthSales > 0) {
        salesGrowth = 100;
    }

    // Recent Orders
    const recentOrdersRaw = await OrderModel.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select('totalAmount status createdAt billingInformation');

    const pendingCount = statsMap['pending']?.count || 0;
    const currentMonthOrders = monthlyStatsResult.find(s => s._id.month === currentMonth && s._id.year === currentYear)?.orders || 0;

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
        recentOrders: recentOrdersRaw.map(order => ({
            _id: order._id,
            customerName: order.billingInformation?.name || 'Unknown',
            amount: order.totalAmount,
            status: order.status,
            date: order.createdAt
        }))
    };
};

export const DashboardService = {
    getStats
};
