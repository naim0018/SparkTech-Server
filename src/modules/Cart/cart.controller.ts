import { StatusCodes } from "http-status-codes";
import catchAsync from "../../app/utils/catchAsync";
import sendResponse from "../../app/utils/sendResponse";
import { CartService } from "./cart.service";

const addToCart = catchAsync(async (req, res) => {
  const result = await CartService.addToCartData(req, req.body);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Item Added to Cart Successfully",
    data: result,
  });
});

const getCart = catchAsync(async (req, res) => {
  const result = await CartService.getCartData(req);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Cart Data Fetched Successfully",
    data: result,
  });
});

const getCartItemById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await CartService.getCartItemByIdData(req, id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Cart Item Fetched Successfully",
    data: result,
  });
});

const updateCartItemById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await CartService.updateCartItemDataById(req, id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Cart Item Updated Successfully",
    data: result,
  });
});

const removeCartItemById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await CartService.removeCartItemDataById(req, id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Cart Item Removed Successfully",
    data: result,
  });
});

export const CartController = {
  addToCart,
  getCart,
  getCartItemById,
  updateCartItemById,
  removeCartItemById
};
