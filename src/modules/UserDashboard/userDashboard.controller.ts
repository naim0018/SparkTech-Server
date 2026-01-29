import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../app/utils/catchAsync';
import sendResponse from '../../app/utils/sendResponse';
import { UserDashboardService } from './userDashboard.service';

import { UserSchema } from '../User/user.model';
import { getTenantModel } from '../../app/utils/getTenantModel';

const getUserStats = catchAsync(async (req, res) => {
  let { phone } = req.query;
  const UserModel = getTenantModel(req, 'User', UserSchema);
  
  if (!phone) {
    // If no phone provided, check if user is authenticated
    const user = (req as any).user;
    if (user && user.email) {
      const userDetails = await UserModel.findOne({ email: user.email });
      if (userDetails && userDetails.phoneNumber) {
        phone = userDetails.phoneNumber;
      }
    }
  }

  if (!phone) {
    throw new Error("Phone number is required");
  }

  const result = await UserDashboardService.getUserDashboardStats(req, phone as string);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "User Dashboard Stats Fetched Successfully",
    data: result,
  });
});

export const UserDashboardController = {
  getUserStats
};
