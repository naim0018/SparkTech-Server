import { StatusCodes } from "http-status-codes";
import catchAsync from "../../app/utils/catchAsync";
import sendResponse from "../../app/utils/sendResponse";
import { categoryService } from "./categories.service";

const createCategory = catchAsync(async (req, res) => {
  const result = await categoryService.createCategory(req, req.body);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Category Created Successfully",
    data: result,
  });
});

const createSubCategory = catchAsync(async (req, res) => {
  const { categoryId } = req.params;
  const result = await categoryService.createSubCategory(req, categoryId, req.body);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "SubCategory Created Successfully",
    data: result,
  });
});

const updateSubCategory = catchAsync(async (req, res) => {
  const { categoryId, subCategoryName } = req.params;
  const result = await categoryService.updateSubCategory(req, categoryId, subCategoryName, req.body);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "SubCategory Updated Successfully",
    data: result,
  });
});

const getAllCategories = catchAsync(async (req, res) => {
  const result = await categoryService.getAllCategories(req);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "All Categories Fetched Successfully",
    data: result,
  });
});

const updateCategoryOrder = catchAsync(async (req, res) => {
  const result = await categoryService.updateCategoryOrder(req, req.body);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Category Order Updated Successfully",
    data: result,
  });
});

const getCategoryById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await categoryService.getCategoryById(req, id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Category Fetched Successfully",
    data: result,
  });
});

const updateCategory = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await categoryService.updateCategory(req, id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Category Updated Successfully",
    data: result,
  });
});

const deleteCategory = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await categoryService.deleteCategory(req, id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Category Deleted Successfully",
    data: result,
  });
});

const deleteSubCategory = catchAsync(async (req, res) => {
  const { categoryId, subCategoryName } = req.params;
  const result = await categoryService.deleteSubCategory(req, categoryId, subCategoryName);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "SubCategory Deleted Successfully",
    data: result,
  });
});

export const CategoryController = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  deleteSubCategory,
  createSubCategory,
  updateCategoryOrder,
  updateSubCategory,
};
