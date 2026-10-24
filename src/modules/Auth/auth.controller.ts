import httpStatus from "http-status";
import catchAsync from "../../app/utils/catchAsync";
import sendResponse from "../../app/utils/sendResponse";
import config from "../../app/config";
import AppError from "../../app/error/AppError";
import { AuthServices } from "./auth.service";


const loginUser = catchAsync(async (req, res) => {
  
  const result = await AuthServices.loginUser(req, req.body);
  const { refreshToken, accessToken, needsPasswordChange } = result;
  res.cookie('refreshToken', refreshToken, {
    secure: config.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: true,
    maxAge: 1000 * 60 * 60 * 24 * 365,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User is logged in successfully!',
    data: {
      accessToken,
      needsPasswordChange,
    },
  });
});

const changePassword = catchAsync(async (req, res) => {
  const { ...passwordData } = req.body;

  const result = await AuthServices.changePassword(req, req.user, passwordData);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Password is updated successfully!',
    data: result,
  });
});

const refreshToken = catchAsync(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken || req.body?.authorization || req.headers?.authorization;
  const result = await AuthServices.refreshToken(req, token);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Access token is retrieved successfully!',
    data: result,
  });
});

const forgetPassword = catchAsync(async (req, res) => {
  const email = req.body.email;
  const result = await AuthServices.forgetPassword(req, email);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Reset link is generated succesfully!',
    data: result,
  });
});

const resetPassword = catchAsync(async (req, res) => {
  const token = req.headers.authorization;

  if (!token) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Something went wrong !');
  }

  const result = await AuthServices.resetPassword(req, req.body, token);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Password reset succesfully!',
    data: result,
  });
});

const googleLogin = catchAsync(async (req, res) => {
  const result = await AuthServices.googleLogin(req, req.body);
  const { refreshToken, accessToken, needsPasswordChange } = result;
  res.cookie('refreshToken', refreshToken, {
    secure: config.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: true,
    maxAge: 1000 * 60 * 60 * 24 * 365,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User is logged in successfully!',
    data: {
      accessToken,
      needsPasswordChange,
    },
  });
});

export const AuthControllers = {
  loginUser,
  changePassword,
  refreshToken,
  forgetPassword,
  resetPassword,
  googleLogin,
};
