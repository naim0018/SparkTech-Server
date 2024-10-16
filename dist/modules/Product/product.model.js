"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductModel = void 0;
const mongoose_1 = require("mongoose");
const ProductImageSchema = new mongoose_1.Schema({
    url: { type: String, required: true },
    alt: { type: String, required: true }
}, { _id: false });
const ProductVariantSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    value: { type: String, required: true }
}, { _id: false });
const ProductSpecificationItemSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    value: { type: String, required: true }
}, { _id: false });
const ProductSpecificationSchema = new mongoose_1.Schema({
    group: { type: String, required: true },
    items: [ProductSpecificationItemSchema]
}, { _id: false });
const ProductReviewSchema = new mongoose_1.Schema({
    user: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    date: { type: Date, default: Date.now }
});
const ProductPriceSchema = new mongoose_1.Schema({
    regular: { type: Number, required: true },
    discounted: { type: Number },
    savings: { type: Number },
    savingsPercentage: { type: Number }
}, { _id: false });
const ProductDimensionsSchema = new mongoose_1.Schema({
    length: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    unit: { type: String, enum: ['cm', 'in'], required: true }
}, { _id: false });
const productSchema = new mongoose_1.Schema({
    productCode: {
        type: String,
        required: true,
        unique: true
    },
    title: { type: String, required: true },
    brand: { type: String, required: true },
    category: { type: String, required: true },
    subcategory: { type: String },
    price: ProductPriceSchema,
    stockStatus: {
        type: String,
        enum: ['In Stock', 'Out of Stock', 'Pre-order'],
        required: true
    },
    stockQuantity: { type: Number },
    images: [ProductImageSchema],
    variants: [ProductVariantSchema],
    keyFeatures: [{ type: String }],
    description: { type: String, required: true },
    specifications: [ProductSpecificationSchema],
    reviews: [ProductReviewSchema],
    rating: {
        average: { type: Number, default: 0 },
        count: { type: Number, default: 0 }
    },
    relatedProducts: [{ type: mongoose_1.Types.ObjectId, ref: 'Product' }],
    tags: [{ type: String }],
    paymentOptions: [{ type: String }],
    weight: { type: String },
    dimensions: { type: ProductDimensionsSchema },
    additionalInfo: {
        freeShipping: { type: Boolean, default: false },
        estimatedDelivery: { type: String },
        returnPolicy: { type: String },
        warranty: { type: String }
    },
    isFeatured: { type: Boolean, default: false },
    isOnSale: { type: Boolean, default: false }
}, { timestamps: true });
// Indexes for improved query performance
productSchema.index({ productCode: 1 });
productSchema.index({ title: 'text', description: 'text' });
productSchema.index({ category: 1, subcategory: 1 });
productSchema.index({ 'price.regular': 1, 'price.discounted': 1 });
productSchema.index({ stockStatus: 1 });
// Pre-save hook to ensure productCode is provided
productSchema.pre('save', function (next) {
    if (!this.productCode) {
        next(new Error('Product code is required'));
    }
    else {
        next();
    }
});
exports.ProductModel = (0, mongoose_1.model)('Product', productSchema);
