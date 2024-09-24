import { TProduct } from "./product.interface"
import { ProductModel } from "./product.model"

const addProductData =async (payload : TProduct)=>{
    const result = await ProductModel.create(payload)
    return result 
}
const getAllProductData =async ()=>{
    const result = await ProductModel.find()
    return result 
}


export const ProductService ={
    addProductData,
    getAllProductData
}