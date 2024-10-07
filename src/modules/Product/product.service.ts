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

const updateProductDataById = async (id: string, updateData: Partial<IProduct>) => {
    return await ProductModel.findByIdAndUpdate(id, updateData, { new: true });
};

const deleteProductDataById = async (id: string) => {
    return await ProductModel.findByIdAndDelete(id);
};

export const ProductService ={
    addProductData,
    getAllProductData,
    getProductByIdData,
    updateProductDataById,
    deleteProductDataById,
    

}