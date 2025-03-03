import { IProduct } from "./product.interface"
import ProductModel from "./product.model"


const addProductData = async (payload: IProduct) => {
    const result = await ProductModel.create(payload)
    return result 
}

const getAllProductData = async (query: Record<string, unknown>) => {
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
    const sortKey = sort as string;

    const result = await ProductModel
        .find(filter)
        .sort(sortKey ? { [sortKey]: 1 } : { createdAt: -1 })
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

const getProductByIdData = async (id: string) => {
    return await ProductModel.findById(id);
};

const updateProductDataById = async (id: string, updateData: Partial<IProduct>) => {
    return await ProductModel.findByIdAndUpdate(id, updateData, { new: true });
};

const deleteProductDataById = async (id: string) => {
    return await ProductModel.findByIdAndDelete(id);
};

const getProductsByCategory = async (category: string, limit: number): Promise<IProduct[]> => {
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
