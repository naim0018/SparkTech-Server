import { Request } from "express";
import { IProduct } from "./product.interface"
import { ProductSchema } from "./product.model"
import { getTenantModel } from "../../app/utils/getTenantModel";


const addProductData = async (req: Request, payload: IProduct) => {
    const ProductModel = getTenantModel(req, 'Product', ProductSchema);
    const result = await ProductModel.create(payload)
    return result 
}

const getAllProductData = async (req: Request, query: Record<string, unknown>) => {
    const ProductModel = getTenantModel(req, 'Product', ProductSchema);
    const {
        search,
        category,
        stockStatus,
        minPrice,
        maxPrice,
        sort,
        page = 1,
        limit = 12
    } = query;

    let filter: any = {};

    // Add search filter
    if (search) {
        filter.$or = [
            { 'basicInfo.title': { $regex: search, $options: 'i' } },
            { 'basicInfo.category': { $regex: search, $options: 'i' } },
            { 'basicInfo.brand': { $regex: search, $options: 'i' } }
        ];
    }

    // Add category filter
    if (category) {
        filter['basicInfo.category'] = category;
    }

    // Add stock status filter
    if (stockStatus) {
        filter.stockStatus = stockStatus;
    }
    // Add price range filter
    if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = Number(minPrice);
        if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const skip = (Number(page) - 1) * Number(limit);

    // Before the sort line, add type assertion for the sort key
    const result = await ProductModel
        .find(filter)
        .sort(sort ? (sort as string) : '-createdAt')
        .skip(skip)
        .limit(Number(limit));

    const total = await ProductModel.countDocuments(filter);

    return {
        data: result,
        meta: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPage: Math.ceil(total / Number(limit))
        }
    };
}

const getProductByIdData = async (req: Request, id: string) => {
    const ProductModel = getTenantModel(req, 'Product', ProductSchema);
    return await ProductModel.findById(id);
};

const updateProductDataById = async (req: Request, id: string, updateData: Partial<IProduct>) => {
    const ProductModel = getTenantModel(req, 'Product', ProductSchema);
    return await ProductModel.findByIdAndUpdate(id, updateData, { new: true });
};

const deleteProductDataById = async (req: Request, id: string) => {
    const ProductModel = getTenantModel(req, 'Product', ProductSchema);
    return await ProductModel.findByIdAndDelete(id);
};

const getProductsByCategory = async (req: Request, category: string, limit: number): Promise<IProduct[]> => {
    const ProductModel = getTenantModel(req, 'Product', ProductSchema);
    const products = await ProductModel.find({
        'basicInfo.category': { 
            $regex: new RegExp(category, 'i') 
        }
    })
    .limit(limit)
    .sort({ createdAt: -1 });

    return products;
};

export const ProductService = {
    addProductData,
    getAllProductData,
    getProductByIdData,
    updateProductDataById,
    deleteProductDataById,
    getProductsByCategory,
}

