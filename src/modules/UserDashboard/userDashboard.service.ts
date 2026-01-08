import OrderModel from "../Orders/orders.model";

const getUserDashboardStats = async (phone: string) => {
  // Get all orders for this phone number
  const orders = await OrderModel.find({ "billingInformation.phone": phone }).sort({ createdAt: -1 });

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
};

export const UserDashboardService = {
  getUserDashboardStats
};
