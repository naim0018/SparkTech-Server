import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../app/utils/catchAsync';
import sendResponse from '../../app/utils/sendResponse';
import { OrderService } from './orders.service';

const getAllOrders = catchAsync(async (req, res) => {
  const result = await OrderService.getAllOrdersData(req.query, req.store?._id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Orders Fetched Successfully",
    data: result.data,
    meta: result.meta,
  });
});

const createOrder = catchAsync(async (req, res) => {
  const result = await OrderService.addOrderData(req.body, req.store?._id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: "Order Created Successfully",
    data: result,
  });
});

const getOrderById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await OrderService.getOrderByIdData(id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Order Fetched Successfully",
    data: result,
  });
});

const trackOrder = catchAsync(async (req, res) => {
  const { phone, consignmentId, orderId } = req.query;
  let result: any[] = [];
  
  if (orderId) {
    const order = await OrderService.getOrderByIdData(orderId as string);
    result = order ? [order] : [];
  } else if (consignmentId) {
    const order = await OrderService.trackOrderByConsignmentIdData(consignmentId as string, req.store?._id);
    result = order ? [order] : [];
  } else if (phone) {
    result = await OrderService.trackOrderByPhoneData(phone as string, req.store?._id);
  }

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Order(s) Fetched Successfully",
    data: result,
  });
});

const updateOrderById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await OrderService.updateOrderDataById(id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Order Updated Successfully",
    data: result,
  });
});

const deleteOrderById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await OrderService.deleteOrderDataById(id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Order Deleted Successfully",
    data: result,
  });
});

export const OrderController = {
  getAllOrders,
  createOrder,
  getOrderById,
  trackOrder,
  updateOrderById,
  deleteOrderById
};
