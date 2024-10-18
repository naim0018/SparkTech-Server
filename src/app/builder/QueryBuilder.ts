import { FilterQuery, Query } from "mongoose";
import { IProduct} from "../../modules/Product/product.interface";
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
    const excludeFields = ["search", "sort", "limit", "page", "fields", "minPrice", "maxPrice"];
    excludeFields.forEach((el) => delete queryObj[el as keyof typeof queryObj]);

    // Handle price range
    if (this.query.minPrice || this.query.maxPrice) {
      queryObj.price = queryObj.price || {};
      if (this.query.minPrice) {
        (queryObj.price as any).regular = { $gte: Number(this.query.minPrice) };
      }
      if (this.query.maxPrice) {
        (queryObj.price as any).regular = { 
          ...(queryObj.price as any).regular,
          $lte: Number(this.query.maxPrice)
        };
      }
    }

    // Handle stock status
    if (queryObj.stockStatus) {
      switch (queryObj.stockStatus) {
        case 'In Stock':
          queryObj.stockQuantity = { $gt: 0 } as any;
          break;
        case 'Out of Stock':
          queryObj.stockQuantity = 0;
          break;
        case 'Pre-order':
          // Assuming 'isPreOrder' is part of IProduct interface
          (queryObj as any).isPreOrder = true;
          break;
      }
      delete queryObj.stockStatus;
    }

    // Handle category and subcategory with case-insensitive partial matching
    if (queryObj.category) {
      queryObj.category = { $regex: queryObj.category, $options: "i" } as any;
    }
    if (queryObj.subcategory) {
      queryObj.subcategory = { $regex: queryObj.subcategory, $options: "i" } as any;
    }

    // Handle tags as a comma-separated string
    if (queryObj.tags) {
      const tagsArray = Array.isArray(queryObj.tags) 
        ? queryObj.tags 
        : (queryObj.tags as string).split(',').map(tag => tag.trim());
      queryObj.tags = { $in: tagsArray } as any;
    }

    // Handle rating as a minimum value
    if (queryObj.rating) {
      queryObj.rating = { average: { $gte: Number(queryObj.rating) } } as any;
    }

    this.modelQuery = this.modelQuery.find(queryObj);
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
    return this.modelQuery.exec();
  }
}

export default ProductQueryBuilder;

// Code Details Explanation:

// 1. The class uses Mongoose's Query and FilterQuery types for type safety.
// 2. The constructor initializes the query with ProductModel.find() and stores the query parameters.
// 3. The search method creates a complex $or query for partial matching across multiple fields.
// 4. The filter method handles various filtering scenarios:
//    - Price range filtering
//    - Stock status filtering
//    - Category and subcategory partial matching
//    - Tags filtering (supports both array and comma-separated string)
//    - Rating filtering (as a minimum value)
// 5. The sort method allows sorting by multiple fields.
// 6. The paginate method implements skip-limit based pagination.
// 7. The fields method allows selecting specific fields to be returned.
// 8. The countTotal method provides pagination metadata.
// 9. The execute method runs the constructed query and returns the results.
// 10. Each method returns 'this' for method chaining, allowing a fluent API design.
