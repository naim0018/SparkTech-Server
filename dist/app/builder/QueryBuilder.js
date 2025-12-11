"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const product_model_1 = __importDefault(require("../../modules/Product/product.model"));
/**
 * QueryBuilder class for building and executing MongoDB queries for ProductModel
 */
class ProductQueryBuilder {
    /**
     * Constructor for ProductQueryBuilder
     * @param query The query parameters from the request
     */
    constructor(query) {
        this.modelQuery = product_model_1.default.find();
        this.query = query;
    }
    /**
     * Adds a search functionality to the query
     * @returns The ProductQueryBuilder instance for method chaining
     */
    search(p0) {
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
        const queryObj = Object.assign({}, this.query);
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
        }
        else {
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
        var _a;
        const fields = ((_a = this.query.fields) === null || _a === void 0 ? void 0 : _a.split(",").join(" ")) || "-__v";
        this.modelQuery = this.modelQuery.select(fields);
        return this;
    }
    /**
     * Counts the total number of documents matching the query and calculates pagination info
     * @returns An object containing pagination details
     */
    countTotal() {
        return __awaiter(this, void 0, void 0, function* () {
            const total = yield product_model_1.default.countDocuments(this.modelQuery.getFilter());
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
        });
    }
    /**
     * Executes the query and returns the results
     * @returns A promise that resolves to an array of IProduct
     */
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const results = yield this.modelQuery.exec();
                return results;
            }
            catch (error) {
                console.error('Error executing product query:', error);
                throw new Error(`Failed to execute product query: ${error.message}`);
            }
        });
    }
    populate(options) {
        this.modelQuery = this.modelQuery.populate(options);
        return this;
    }
}
exports.default = ProductQueryBuilder;
