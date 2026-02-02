import { Request } from "express";
import { IProduct } from "./product.interface";
import { ProductSchema } from "./product.model";
import { getTenantModel } from "../../app/utils/getTenantModel";

const addProductData = async (req: Request, payload: IProduct) => {
  const ProductModel = getTenantModel(req, "Product", ProductSchema);
  const result = await ProductModel.create(payload);
  return result;
};

const getAllProductData = async (
  req: Request,
  query: Record<string, unknown>,
) => {
  const ProductModel = getTenantModel(req, "Product", ProductSchema);
  const {
    search,
    category,
    stockStatus,
    minPrice,
    maxPrice,
    rating,
    sort,
    page = 1,
    limit = 12,
  } = query;

  let filter: any = {};

  // Add search filter
  if (search) {
    filter.$or = [
      { "basicInfo.title": { $regex: search, $options: "i" } },
      { "basicInfo.category": { $regex: search, $options: "i" } },
    ];
  }

  // Add category filter
  if (category) {
    filter["basicInfo.category"] = { $regex: new RegExp(`^${category}$`, "i") };
  }


  // Add stock status filter
  if (stockStatus) {
    filter.stockStatus = stockStatus;
  }

  // Add price range filter
  if (minPrice || maxPrice) {
    if (minPrice)
      filter["price.regular"] = {
        ...filter["price.regular"],
        $gte: Number(minPrice),
      };
    if (maxPrice)
      filter["price.regular"] = {
        ...filter["price.regular"],
        $lte: Number(maxPrice),
      };
  }

  // Add rating filter
  if (rating && Number(rating) > 0) {
    filter["rating.average"] = { $gte: Number(rating) };
  }

  const skip = (Number(page) - 1) * Number(limit);

  // Before the sort line, add type assertion for the sort key
  const result = await ProductModel.find(filter)
    .sort(sort ? (sort as string) : "-createdAt")
    .skip(skip)
    .limit(Number(limit));

  const total = await ProductModel.countDocuments(filter);

  return {
    data: result,
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPage: Math.ceil(total / Number(limit)),
    },
  };
};

const getProductByIdData = async (req: Request, id: string) => {
  const ProductModel = getTenantModel(req, "Product", ProductSchema);
  return await ProductModel.findById(id);
};

const updateProductDataById = async (
  req: Request,
  id: string,
  updateData: Partial<IProduct>,
) => {
  const ProductModel = getTenantModel(req, "Product", ProductSchema);
  return await ProductModel.findByIdAndUpdate(id, updateData, { new: true });
};

const deleteProductDataById = async (req: Request, id: string) => {
  const ProductModel = getTenantModel(req, "Product", ProductSchema);
  return await ProductModel.findByIdAndDelete(id);
};

const getNewArrivalsData = async (req: Request): Promise<IProduct[]> => {
  const ProductModel = getTenantModel(req, "Product", ProductSchema);

  // 1. Get up to 2 latest products with combo pricing
  const comboProducts = await ProductModel.find({
    comboPricing: { $exists: true, $not: { $size: 0 } },
  })
    .sort({ createdAt: -1 })
    .limit(2);

  const comboIds = comboProducts.map((p) => p._id);

  // 2. Get the latest products excluding the picked combo products to fill 8 slots
  const latestProducts = await ProductModel.find({
    _id: { $nin: comboIds },
  })
    .sort({ createdAt: -1 })
    .limit(8);

  // 3. Assemble the 8 products
  // Indices 0 and 4 are for the "Large" cards (ideally combo products)
  const result: any[] = new Array(8).fill(null);
  let latestIdx = 0;

  // Place first combo product at index 0
  if (comboProducts.length > 0) {
    result[0] = comboProducts[0];
  } else if (latestProducts[latestIdx]) {
    result[0] = latestProducts[latestIdx++];
  }

  // Place second combo product at index 4
  if (comboProducts.length > 1) {
    result[4] = comboProducts[1];
  } else if (latestProducts[latestIdx]) {
    result[4] = latestProducts[latestIdx++];
  }

  // Fill the remaining slots
  for (let i = 0; i < 8; i++) {
    if (result[i] === null && latestProducts[latestIdx]) {
      result[i] = latestProducts[latestIdx++];
    }
  }

  // Filter out any remaining nulls if there were fewer than 8 products total
  return result.filter((p) => p !== null);
};

const getProductsByCategory = async (
  req: Request,
  category: string,
  limit: number,
): Promise<IProduct[]> => {
  const ProductModel = getTenantModel(req, "Product", ProductSchema);
  const products = await ProductModel.find({
    "basicInfo.category": {
      $regex: new RegExp(category, "i"),
    },
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
  getNewArrivalsData,
};
