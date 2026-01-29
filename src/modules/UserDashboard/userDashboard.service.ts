import { Request } from "express";
import { OrderSchema } from "../Orders/orders.model";
import { getTenantModel } from "../../app/utils/getTenantModel";

const getUserDashboardStats = async (req: Request, phone: string) => {
  const OrderModel = getTenantModel(req, 'Order', OrderSchema);
  // Get all orders for this phone number
  const orders = await OrderModel.find({ "billingInformation.phone": phone }).sort({ createdAt: -1 });

  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, order) => sum + (Number((order as any).totalAmount) || 0), 0);
  
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
      _id: (order as any)._id,
      date: (order as any).createdAt,
      totalAmount: (order as any).totalAmount,
      status: (order as any).status,
      itemsCount: (order as any).items.length
    }))
  };
};

export const UserDashboardService = {
  getUserDashboardStats
};

