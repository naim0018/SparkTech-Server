import { StatusCodes } from "http-status-codes";
import catchAsync from "../../app/utils/catchAsync";
import sendResponse from "../../app/utils/sendResponse";
import { facebookPixelService } from "./facebookPixel.service";

const createFacebookPixel = catchAsync(async (req, res) => {
    const result = await facebookPixelService.createFacebookPixel(req, req.body);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Facebook Pixel config created successfully',
        data: result
    });
});

const getFacebookPixel = catchAsync(async (req, res) => {
    const result = await facebookPixelService.getFacebookPixel(req);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Facebook Pixel config fetched successfully',
        data: result
    });
});

const updateFacebookPixel = catchAsync(async (req, res) => {
    const result = await facebookPixelService.updateFacebookPixel(req, req.body);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Facebook Pixel config updated successfully',
        data: result
    });
});

const deleteFacebookPixel = catchAsync(async (req, res) => {
    const result = await facebookPixelService.deleteFacebookPixel(req);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Facebook Pixel config deleted successfully',
        data: result
    });
});

export const facebookPixelController = {
    createFacebookPixel,
    getFacebookPixel,
    updateFacebookPixel,
    deleteFacebookPixel
}
