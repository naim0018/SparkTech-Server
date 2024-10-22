import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../app/utils/catchAsync';
import sendResponse from '../../app/utils/sendResponse';
import { OrderService } from './orders.service';

const getAllOrders = catchAsync(async (req, res) => {
  const result = await OrderService.getAllOrdersData();
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Orders Fetched Successfully",
    data: result,
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
  updateOrderById,
  deleteOrderById
};
