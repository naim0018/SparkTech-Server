import ProductQueryBuilder from "../../app/builder/QueryBuilder"
import { IProduct } from "./product.interface"
import { ProductModel } from "./product.model"

const addProductData =async (payload : IProduct)=>{
    const result = await ProductModel.create(payload)
    return result 
}
const getAllProductData = async (query: Record<string, unknown>) => {
    console.log(query);
    const queryBuilder = new ProductQueryBuilder(query)
        .search(query.search as (keyof IProduct)[])
        .filter()
        .sort()
        .paginate()
        .fields();
    const result = await queryBuilder.execute();
    const paginationInfo = await queryBuilder.countTotal();

    return {
        data: result,
        meta: paginationInfo
    };
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
