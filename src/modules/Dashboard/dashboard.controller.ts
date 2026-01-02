import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../app/utils/catchAsync";
import sendResponse from "../../app/utils/sendResponse";
import { DashboardService } from "./dashboard.service";

const getStats = catchAsync(async (req: Request, res: Response) => {
    const result = await DashboardService.getStats();

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Dashboard stats retrieved successfully",
        data: result,
    });
});

export const DashboardController = {
    getStats
};
