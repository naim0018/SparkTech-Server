import { FilterQuery, Query } from "mongoose";
import { IProduct } from "../../modules/Product/product.interface";
import { ProductModel } from "../../modules/Product/product.model";

/**
 * QueryBuilder class for building and executing MongoDB queries for ProductModel
 */
class ProductQueryBuilder {
  public modelQuery: Query<IProduct[], IProduct>;
  public query: Record<string, unknown>;

  /**
   * Constructor for ProductQueryBuilder
   * @param query The query parameters from the request
   */
  constructor(query: Record<string, unknown>) {
    this.modelQuery = ProductModel.find(); // Initialize the query with the ProductModel
    this.query = query; // Store the query parameters
  }

  /**
   * Adds a search functionality to the query
   * @param searchableFields An array of field names to search in
   * @returns The ProductQueryBuilder instance for method chaining
   */
  search(searchableFields: (keyof IProduct)[]) {
    const search = this.query.search as string;
    if (search) {
      this.modelQuery = this.modelQuery.find({
        $or: searchableFields.map((field) => {
          if (field === 'tags') {
            // For tags, use $in operator with case-insensitive regex
            return { [field]: { $in: [new RegExp(search, 'i')] } };
          }
          // For other fields, use $regex with case-insensitive option
          return { [field]: { $regex: search, $options: "i" } };
        }),
      });
    }
    return this;
  }

  /**
   * Applies filters to the query based on the query parameters
   * @returns The ProductQueryBuilder instance for method chaining
   */
  filter() {
    const queryObj = { ...this.query } as FilterQuery<IProduct>;
    const excludeFields = ["search", "sort", "limit", "page", "fields"];
    excludeFields.forEach((el) => delete queryObj[el as keyof typeof queryObj]);

    const buildQuery = (filters: Record<string, any>) => {
      const query: FilterQuery<IProduct> = {};

      // Price Range
      if (filters.priceRange && Array.isArray(filters.priceRange) && filters.priceRange[1] > 0) {
        query['price.regular'] = {
          $gte: filters.priceRange[0],
          $lte: filters.priceRange[1],
        };
      }

      // Availability (Stock Status)
      if (filters.stockStatus && filters.stockStatus !== 'all') {
        switch (filters.stockStatus) {
          case 'In Stock':
            query.stockQuantity = { $gt: 0 };
            break;
          case 'Out of Stock':
            query.stockQuantity = 0;
            break;
          case 'Pre-order':
            query.stockStatus = 'Pre-order';
            break;
        }
      }

      // Category
      if (filters.category && filters.category !== 'all') {
        query['basicInfo.category'] = filters.category;
      }

      // Subcategory
      if (filters.subcategory && filters.subcategory !== 'all') {
        query['basicInfo.subcategory'] = filters.subcategory;
      }

      // Brand
      if (filters.brand && filters.brand !== 'all') {
        query['basicInfo.brand'] = filters.brand;
      }

      return query;
    };

    const builtQuery = buildQuery(queryObj);

    // Handle tags as a comma-separated string
    if (queryObj.tags) {
      const tagsArray = Array.isArray(queryObj.tags) 
        ? queryObj.tags 
        : (queryObj.tags as string).split(',').map(tag => tag.trim());
      builtQuery.tags = { $in: tagsArray };
    }

    this.modelQuery = this.modelQuery.find(builtQuery);
    return this;
  }

  /**
   * Applies sorting to the query
   * @returns The ProductQueryBuilder instance for method chaining
   */
  sort() {
    const sort = (this.query.sort as string)?.split(",").join(" ") || "-createdAt";
    this.modelQuery = this.modelQuery.sort(sort);
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
    const fields = (this.query.fields as string)?.split(",").join(" ") || "-__v";
    this.modelQuery = this.modelQuery.select(fields);
    return this;
  }

  /**
   * Counts the total number of documents matching the query and calculates pagination info
   * @returns An object containing pagination details
   */
  async countTotal() {
    const totalQueries = this.modelQuery.getFilter();
    const total = await ProductModel.countDocuments(totalQueries);
    const page = Number(this.query.page) || 1;
    const limit = Number(this.query.limit) || 10;
    const totalPage = Math.ceil(total / limit);

    return {
      page,
      limit,
      total,
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
      console.log(`Query executed successfully. Found ${results.length} products.`);
      return results;
    } catch (error) {
      console.error('Error executing product query:', error);
      throw error; // Re-throw the error for the global error handler
    }
  }
}

export default ProductQueryBuilder;
