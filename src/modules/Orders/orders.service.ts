import { OrderInterface } from "./orders.interface";
import OrderModel from "./orders.model";

const addOrderData = async (payload: OrderInterface) => {
  const result = await OrderModel.create(payload);
  return result;
};

const getAllOrdersData = async () => {
  const result = await OrderModel.find().populate("items.product", "basicInfo.title basicInfo.price basicInfo.description basicInfo.brand basicInfo.category basicInfo.subcategory variants");
  return result;
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

export const OrderService = {
  addOrderData,
  getAllOrdersData,
  getOrderByIdData,
  updateOrderDataById,
  deleteOrderDataById,
};
