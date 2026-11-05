import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../app/utils/catchAsync";
import sendResponse from "../../app/utils/sendResponse";
import { TrackingServices } from "./tracking.service";

const getTrackingSettings = catchAsync(async (req: Request, res: Response) => {
  const result = await TrackingServices.getTrackingSettings(req);
  
  // Mask secret keys so they are not exposed to the frontend/public
  const data = result.toObject ? result.toObject() : JSON.parse(JSON.stringify(result));
  
  if (data.facebookAccessToken) data.facebookAccessToken = "**********";
  if (data.steadfastApiKey) data.steadfastApiKey = "**********";
  if (data.steadfastSecretKey) data.steadfastSecretKey = "**********";
  if (data.googleAnalyticsServiceAccountJson) data.googleAnalyticsServiceAccountJson = "**********";

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Tracking settings retrieved successfully",
    data: data,
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
