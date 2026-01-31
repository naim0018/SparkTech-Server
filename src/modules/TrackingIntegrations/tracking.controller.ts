import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../app/utils/catchAsync";
import sendResponse from "../../app/utils/sendResponse";
import { TrackingServices } from "./tracking.service";

const getTrackingSettings = catchAsync(async (req: Request, res: Response) => {
  const result = await TrackingServices.getTrackingSettings(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Tracking settings retrieved successfully",
    data: result,
  });
});

const updateTrackingSettings = catchAsync(async (req: Request, res: Response) => {
  const result = await TrackingServices.updateTrackingSettings(req, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Tracking settings updated successfully",
    data: result,
  });
});

export const TrackingController = {
  getTrackingSettings,
  updateTrackingSettings,
};
