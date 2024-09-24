import { StatusCodes } from "http-status-codes";
import catchAsync from "../../app/utils/catchAsync";
import sendResponse from "../../app/utils/sendResponse";
import { ProductService } from "./product.service";

const addProduct = catchAsync(async(req,res)=>{
const result = await ProductService.addProductData(req.body)
sendResponse(res,({
    success:true,
    statusCode:StatusCodes.OK,
    message:"Product Added Successfully",
    data:result,
}))
})
const getAllProduct = catchAsync(async(req,res)=>{
const result = await ProductService.getAllProductData()
sendResponse(res,({
    success:true,
    statusCode:StatusCodes.OK,
    message:"All Data Fetched",
    data:result,
}))

})

export const ProductController = {
    addProduct,
    getAllProduct
}