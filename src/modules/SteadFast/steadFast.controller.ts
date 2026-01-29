import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../app/utils/catchAsync";
import sendResponse from "../../app/utils/sendResponse";
import { SteadfastService } from "./steadfast.service";


const createOrder = catchAsync(async (req: Request, res: Response) => {
  const result = await SteadfastService.createOrder(req, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order created in Steadfast successfully",
    data: result,
  });
});

const bulkCreateOrder = catchAsync(async (req: Request, res: Response) => {
  const result = await SteadfastService.bulkCreateOrder(req, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Bulk orders created in Steadfast successfully",
    data: result,
  });
});

const checkDeliveryStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await SteadfastService.checkDeliveryStatus(req, id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Delivery status fetched successfully",
    data: result,
  });
});

const getCurrentBalance = catchAsync(async (req: Request, res: Response) => {
  const result = await SteadfastService.getCurrentBalance(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Current balance fetched successfully",
    data: result,
  });
});

const getReturnRequests = catchAsync(async (req: Request, res: Response) => {
    const result = await SteadfastService.getReturnRequests(req, req.query);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Return requests fetched successfully",
      data: result,
    });
});
  
const getPoliceStations = catchAsync(async (req: Request, res: Response) => {
    const result = await SteadfastService.getPoliceStations(req);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Police stations fetched successfully",
      data: result,
    });
});

export const SteadfastController = {
  createOrder,
  bulkCreateOrder,
  checkDeliveryStatus,
  getCurrentBalance,
  getReturnRequests,
  getPoliceStations
};
