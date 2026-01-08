import { StatusCodes } from "http-status-codes";
import catchAsync from "../../app/utils/catchAsync";
import sendResponse from "../../app/utils/sendResponse";
import { googleAnalyticsService } from "./googleAnalytics.service";

const createGoogleAnalytics = catchAsync(async (req, res) => {
    const { id } = req.body;
    const result = await googleAnalyticsService.createGoogleAnalytics(id);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Google Analytics config created successfully',
        data: result
    });
});

const getGoogleAnalytics = catchAsync(async (req, res) => {
    const result = await googleAnalyticsService.getGoogleAnalytics();
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Google Analytics config fetched successfully',
        data: result
    });
});

const updateGoogleAnalytics = catchAsync(async (req, res) => {
    const { id } = req.body;
    const result = await googleAnalyticsService.updateGoogleAnalytics(id);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Google Analytics config updated successfully',
        data: result
    });
});

const deleteGoogleAnalytics = catchAsync(async (req, res) => {
    const result = await googleAnalyticsService.deleteGoogleAnalytics();
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Google Analytics config deleted successfully',
        data: result
    });
});

export const googleAnalyticsController = {
    createGoogleAnalytics,
    getGoogleAnalytics,
    updateGoogleAnalytics,
    deleteGoogleAnalytics
}
