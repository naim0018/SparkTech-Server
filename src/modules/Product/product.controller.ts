import { StatusCodes } from "http-status-codes";
import catchAsync from "../../app/utils/catchAsync";
import sendResponse from "../../app/utils/sendResponse";
import { ProductService } from "./product.service";
import httpStatus from "http-status";

const addProduct = catchAsync(async (req, res) => {
  const result = await ProductService.addProductData(req, req.body);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Product Added Successfully",
    data: result,
  });
});

const getAllProduct = catchAsync(async (req, res) => {
  const result = await ProductService.getAllProductData(req, req.query)
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "All Data Fetched",
    data: result.data,
    meta: result.meta
  });
});

const getProductById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await ProductService.getProductByIdData(req, id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Product Fetched Successfully",
    data: result,
  });
});

const updateProductById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await ProductService.updateProductDataById(req, id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Product Updated Successfully",
    data: result,
  });
});

const deleteProductById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await ProductService.deleteProductDataById(req, id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Product Deleted Successfully",
    data: result,
  });
});

const getProductsByCategory = catchAsync(async (req, res) => {
  const { category } = req.params;
  const { limit = 10 } = req.query;
  
  const result = await ProductService.getProductsByCategory(req, category, Number(limit));

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Products retrieved successfully',
    data: result
  });
});

export const ProductController = {
  addProduct,
  getAllProduct,
  getProductById,
  updateProductById,
  deleteProductById,
  getProductsByCategory
};