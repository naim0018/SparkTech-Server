"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserDashboardController = void 0;
const http_status_codes_1 = require("http-status-codes");
const catchAsync_1 = __importDefault(require("../../app/utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../app/utils/sendResponse"));
const userDashboard_service_1 = require("./userDashboard.service");
const user_model_1 = require("../User/user.model");
const getUserStats = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { phone } = req.query;
    if (!phone) {
        // If no phone provided, check if user is authenticated
        const user = req.user;
        if (user && user.email) {
            const userDetails = yield user_model_1.UserModel.findOne({ email: user.email });
            if (userDetails && userDetails.phoneNumber) {
                phone = userDetails.phoneNumber;
            }
        }
    }
    if (!phone) {
        throw new Error("Phone number is required");
    }
    const result = yield userDashboard_service_1.UserDashboardService.getUserDashboardStats(phone);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: "User Dashboard Stats Fetched Successfully",
        data: result,
    });
}));
exports.UserDashboardController = {
    getUserStats
};
