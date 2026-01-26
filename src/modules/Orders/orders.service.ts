import { OrderInterface } from "./orders.interface";
import OrderModel from "./orders.model";

const addOrderData = async (payload: OrderInterface, storeId: string) => {
  const result = await OrderModel.create({ ...payload, storeId });
  return result;
};

const getAllOrdersData = async (query: Record<string, unknown>, storeId: string) => {
  const {
      search,
      status,
      sort,
      order,
      page = 1,
      limit = 10
  } = query;

  let filter: any = { storeId };

  if (search) {
      filter.$or = [
          { 'billingInformation.name': { $regex: search, $options: 'i' } },
          { 'billingInformation.phone': { $regex: search, $options: 'i' } },
          { consignment_id: { $regex: search, $options: 'i' } },
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
  
  let sortCriteria: any = { createdAt: -1 };
  if (sort) {
      sortCriteria = { [sort as string]: order === 'asc' ? 1 : -1 };
  }

  const result = await OrderModel
      .find(filter)
      .populate("items.product", "basicInfo.title basicInfo.price basicInfo.description basicInfo.brand basicInfo.category basicInfo.subcategory variants")
      .sort(sortCriteria)
      .skip(skip)
      .limit(Number(limit));

  const total = await OrderModel.countDocuments(filter);

  return {
    data: result,
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPage: Math.ceil(total / Number(limit))
    }
  };
};

const getOrderByIdData = async (id: string) => {
  const result = await OrderModel.findById(id).populate("items.product", "basicInfo.title basicInfo.price basicInfo.description basicInfo.brand basicInfo.category basicInfo.subcategory variants");
  return result;
};

const updateOrderDataById = async (
  id: string,
  updateData: Partial<OrderInterface>
) => {
  return await OrderModel.findByIdAndUpdate(id, updateData, {
    new: true,
  }).populate("items.product");
};

const deleteOrderDataById = async (id: string) => {
  return await OrderModel.findByIdAndDelete(id);
};

const trackOrderByPhoneData = async (phone: string, storeId: string) => {
  const result = await OrderModel.find({ "billingInformation.phone": phone, storeId })
    .populate("items.product", "basicInfo.title basicInfo.price basicInfo.description basicInfo.brand basicInfo.category basicInfo.subcategory variants")
    .sort({ createdAt: -1 });
  return result;
};

const trackOrderByConsignmentIdData = async (consignmentId: string, storeId: string) => {
  const result = await OrderModel.findOne({ consignment_id: consignmentId, storeId })
    .populate("items.product", "basicInfo.title basicInfo.price basicInfo.description basicInfo.brand basicInfo.category basicInfo.subcategory variants");
  return result;
};

export const OrderService = {
  addOrderData,
  getAllOrdersData,
  getOrderByIdData,
  trackOrderByPhoneData,
  trackOrderByConsignmentIdData,
  updateOrderDataById,
  deleteOrderDataById,
};
