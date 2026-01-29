import { Request } from "express";
import { OrderInterface } from "./orders.interface";
import { OrderSchema } from "./orders.model";
import { getTenantModel } from "../../app/utils/getTenantModel";

const addOrderData = async (req: Request, payload: OrderInterface) => {
  const OrderModel = getTenantModel(req, 'Order', OrderSchema);
  const result = await OrderModel.create(payload);
  return result;
};

const getAllOrdersData = async (req: Request, query: Record<string, unknown>) => {
  const OrderModel = getTenantModel(req, 'Order', OrderSchema);
  const {
      search,
      status,
      sort,
      order,
      page = 1,
      limit = 10
  } = query;

  let filter: any = {};

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

const getOrderByIdData = async (req: Request, id: string) => {
  const OrderModel = getTenantModel(req, 'Order', OrderSchema);
  const result = await OrderModel.findById(id).populate("items.product", "basicInfo.title basicInfo.price basicInfo.description basicInfo.brand basicInfo.category basicInfo.subcategory variants");
  return result;
};

const updateOrderDataById = async (
  req: Request,
  id: string,
  updateData: Partial<OrderInterface>
) => {
  const OrderModel = getTenantModel(req, 'Order', OrderSchema);
  return await OrderModel.findByIdAndUpdate(id, updateData, {
    new: true,
  }).populate("items.product");
};

const deleteOrderDataById = async (req: Request, id: string) => {
  const OrderModel = getTenantModel(req, 'Order', OrderSchema);
  return await OrderModel.findByIdAndDelete(id);
};

const trackOrderByPhoneData = async (req: Request, phone: string) => {
  const OrderModel = getTenantModel(req, 'Order', OrderSchema);
  const result = await OrderModel.find({ "billingInformation.phone": phone })
    .populate("items.product", "basicInfo.title basicInfo.price basicInfo.description basicInfo.brand basicInfo.category basicInfo.subcategory variants")
    .sort({ createdAt: -1 });
  return result;
};

const trackOrderByConsignmentIdData = async (req: Request, consignmentId: string) => {
  const OrderModel = getTenantModel(req, 'Order', OrderSchema);
  const result = await OrderModel.findOne({ consignment_id: consignmentId })
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

