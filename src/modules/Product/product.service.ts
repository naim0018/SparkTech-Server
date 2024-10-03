
import { IProduct } from "./product.interface"
import { ProductModel } from "./product.model"

const addProductData =async (payload : IProduct)=>{
    const result = await ProductModel.create(payload)
    return result 
}
const getAllProductData =async ()=>{
    const result = await ProductModel.find()
    return result 
}

const getProductByIdData = async (id: string) => {
    return await ProductModel.findById(id);
};

export const ProductService ={
    addProductData,
    getAllProductData,
    getProductByIdData
}