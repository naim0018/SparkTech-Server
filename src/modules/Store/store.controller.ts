import { Request, Response } from 'express';
import { StoreModel } from './store.model';
import sendResponse from '../../app/utils/sendResponse';
import httpStatus from 'http-status';
import catchAsync from '../../app/utils/catchAsync';

const getStoreConfig = catchAsync(async (req: Request, res: Response) => {
  // storeResolver middleware should have already attached the store to the request
  const store = req.store;

  if (!store) {
      // Should create a proper error class in your project, using generic response for now
      return res.status(404).json({ success: false, message: "Store context missing"});
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Store configuration retrieved successfully',
    data: {
        _id: store._id,
        name: store.name,
        identity: store.identity,
        settings: store.settings
    },
  });
});

export const StoreController = {
  getStoreConfig,
};
