import { FilterQuery, Query } from "mongoose";
import { IProduct } from "../../modules/Product/product.interface";
import ProductModel from "../../modules/Product/product.model";

/**
 * QueryBuilder class for building and executing MongoDB queries for ProductModel
 */
class ProductQueryBuilder {
  public modelQuery: Query<IProduct[], IProduct>;
  public query: {
    search?: string;
    sort?: string;
    limit?: number;
    page?: number;
    fields?: string;
    stockStatus?: 'all' | 'In Stock' | 'Out of Stock' | 'Pre-order';
    category?: string;
    subcategory?: string;
    brand?: string;
    tags?: string | string[];
    [key: string]: unknown;
  };

  /**
   * Constructor for ProductQueryBuilder
   * @param query The query parameters from the request
   */
  constructor(query: Record<string, unknown>) {
    this.modelQuery = ProductModel.find();
    this.query = query as ProductQueryBuilder['query'];
  }

  /**
   * Adds a search functionality to the query
   * @returns The ProductQueryBuilder instance for method chaining
   */
  search(p0: (keyof IProduct)[]) {
    const search = this.query.search;
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      this.modelQuery = this.modelQuery.find({
        $or: [
          { 'basicInfo.title': searchRegex },
          { 'basicInfo.category': searchRegex },
          { 'basicInfo.subcategory': searchRegex },
          { 'basicInfo.brand': searchRegex }
        ]
      });
    }
    return this;
  }

  /**
   * Applies filters to the query based on the query parameters
   * @returns The ProductQueryBuilder instance for method chaining
   */
  filter() {
    const queryObj = { ...this.query };
    const excludeFields = ['page', 'sort', 'limit', 'fields', 'search'];
    excludeFields.forEach(field => delete queryObj[field]);

    if (queryObj.category) {
      this.modelQuery = this.modelQuery.find({
        'basicInfo.category': queryObj.category
      });
    }

    if (queryObj.subcategory) {
      this.modelQuery = this.modelQuery.find({
        'basicInfo.subcategory': queryObj.subcategory
      });
    }

    if (queryObj.stockStatus && queryObj.stockStatus !== 'all') {
      this.modelQuery = this.modelQuery.find({
        'basicInfo.stockStatus': queryObj.stockStatus
      });
    }

    return this;
  }

  /**
   * Applies sorting to the query
   * @returns The ProductQueryBuilder instance for method chaining
   */
  sort() {
    if (this.query.sort) {
      const sortFields = this.query.sort.split(',');
      const sortQuery = sortFields
        .map(field => {
          if (field === 'price.regular' || field === '-price.regular') {
            return field;
          }
          return field.startsWith('-') ? field : `-${field}`;
        })
        .join(' ');
      this.modelQuery = this.modelQuery.sort(sortQuery);
    } else {
      this.modelQuery = this.modelQuery.sort('-createdAt');
    }
    return this;
  }

  /**
   * Applies pagination to the query
   * @returns The ProductQueryBuilder instance for method chaining
   */
  paginate() {
    const page = Number(this.query.page) || 1;
    const limit = Number(this.query.limit) || 10;
    const skip = (page - 1) * limit;
    this.modelQuery = this.modelQuery.skip(skip).limit(limit);
    return this;
  }

  /**
   * Selects specific fields to be returned in the query result
   * @returns The ProductQueryBuilder instance for method chaining
   */
  fields() {
    const fields = this.query.fields?.split(",").join(" ") || "-__v";
    this.modelQuery = this.modelQuery.select(fields);
    return this;
  }

  /**
   * Counts the total number of documents matching the query and calculates pagination info
   * @returns An object containing pagination details
   */
  async countTotal() {
    const total = await ProductModel.countDocuments(this.modelQuery.getFilter());
    const page = Number(this.query.page) || 1;
    const limit = Number(this.query.limit) || 10;
    const skip = (page - 1) * limit;
    const totalPage = Math.ceil(total / limit);

    return {
      page,
      limit,
      total,
      skip,
      totalPage,
    };
  }

  /**
   * Executes the query and returns the results
   * @returns A promise that resolves to an array of IProduct
   */
  async execute(): Promise<IProduct[]> {
    try {
      const results = await this.modelQuery.exec();
      return results;
    } catch (error) {
      console.error('Error executing product query:', error);
      throw new Error(`Failed to execute product query: ${(error as Error).message}`);
    }
  }

  populate(options: { path: string, select: string }) {
    this.modelQuery = this.modelQuery.populate(options);
    return this;
  }
}

export default ProductQueryBuilder;
