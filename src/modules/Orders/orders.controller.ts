import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../app/utils/catchAsync';
import sendResponse from '../../app/utils/sendResponse';
import { OrderService } from './orders.service';

const getAllOrders = catchAsync(async (req, res) => {
  const result = await OrderService.getAllOrdersData(req.query);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Orders Fetched Successfully",
    data: result.data,
    meta: result.meta,
  });
});

const createOrder = catchAsync(async (req, res) => {
  const result = await OrderService.addOrderData(req.body);
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
  const { phone, consignmentId } = req.query;
  let result;
  
  if (consignmentId) {
    result = await OrderService.trackOrderByConsignmentIdData(consignmentId as string);
    // Wrap single result in array to match frontend expectation if needed, or handle null
    // Frontend expects array for phone search, maybe single object for ID/Consignment?
    // Let's return as data. If frontend expects array for phone and object for others, we must be consistent.
    // The previous trackOrderByPhone returned `find()` result (Array).
    // `trackOrderByConsignmentIdData` uses `findOne` (Object).
    // Let's stick to what appropriate for each. Frontend handles it.
  } else {
    result = await OrderService.trackOrderByPhoneData(phone as string);
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
