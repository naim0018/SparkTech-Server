"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductSchema = void 0;
const mongoose_1 = require("mongoose");
const ProductImageSchema = new mongoose_1.Schema({
    url: { type: String, required: true },
    alt: { type: String, required: true },
}, { _id: false });
const ProductVideoSchema = new mongoose_1.Schema({
    url: { type: String, required: true },
    title: { type: String, required: true },
    thumbnail: { type: String },
    platform: { type: String, enum: ["youtube", "vimeo", "direct"] },
}, { _id: false });
const ProductVariantItemSchema = new mongoose_1.Schema({
    value: { type: String, required: true },
    price: { type: Number },
    stock: { type: Number },
    image: {
        url: { type: String },
        alt: { type: String },
    },
}, { _id: false });
const ProductVariantSchema = new mongoose_1.Schema({
    group: { type: String, required: true },
    items: [ProductVariantItemSchema],
}, { _id: false });
const ProductSpecificationItemSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    value: { type: String, required: true },
}, { _id: false });
const ProductSpecificationSchema = new mongoose_1.Schema({
    group: { type: String, required: true },
    items: [ProductSpecificationItemSchema],
}, { _id: false });
const ProductReviewSchema = new mongoose_1.Schema({
    user: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    date: { type: Date, default: Date.now },
});
const ProductPriceSchema = new mongoose_1.Schema({
    regular: { type: Number, required: true },
    discounted: { type: Number },
    savings: { type: Number },
    savingsPercentage: { type: Number },
    selectedVariants: { type: Map, of: String },
}, { _id: false });
const ProductShippingDetailsSchema = new mongoose_1.Schema({
    length: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    weight: { type: Number, required: true },
    dimensionUnit: { type: String, enum: ["cm", "in"], required: true },
    weightUnit: { type: String, enum: ["kg", "lb"], required: true },
}, { _id: false });
const ProductSEOSchema = new mongoose_1.Schema({
    metaTitle: { type: String },
    metaDescription: { type: String },
    slug: { type: String, sparse: true },
}, { _id: false });
const ProductBasicInfoSchema = new mongoose_1.Schema({
    productCode: { type: String, unique: true },
    title: { type: String, required: true },
    brand: { type: String, required: true },
    category: { type: String, required: true },
    subcategory: { type: String },
    description: { type: String, required: true },
    keyFeatures: [{ type: String }],
    addDeliveryCharge: { type: Boolean, default: false },
    deliveryChargeInsideDhaka: { type: Number },
    deliveryChargeOutsideDhaka: { type: Number },
}, { _id: false });
const ComboPricingSchema = new mongoose_1.Schema({
    minQuantity: { type: Number, required: true },
    discount: { type: Number, required: true },
    discountType: {
        type: String,
        enum: ["total", "per_product"],
        default: "total",
    },
}, { _id: false });
const BulkPricingSchema = new mongoose_1.Schema({
    minQuantity: { type: Number, required: true },
    price: { type: Number, required: true },
}, { _id: false });
const productSchema = new mongoose_1.Schema({
    basicInfo: { type: ProductBasicInfoSchema, required: true },
    price: { type: ProductPriceSchema, required: true },
    comboPricing: [ComboPricingSchema],
    bulkPricing: [BulkPricingSchema],
    stockStatus: {
        type: String,
        enum: ["In Stock", "Out of Stock", "Pre-order"],
        required: true,
    },
    stockQuantity: { type: Number },
    sold: { type: Number, default: 0 },
    images: { type: [ProductImageSchema], required: true },
    videos: [ProductVideoSchema],
    variants: [ProductVariantSchema],
    specifications: [ProductSpecificationSchema],
    reviews: [ProductReviewSchema],
    rating: {
        average: { type: Number, default: 0 },
        count: { type: Number, default: 0 },
    },
    relatedProducts: [{ type: mongoose_1.Types.ObjectId, ref: "Product" }],
    tags: [{ type: String }],
    shippingDetails: { type: ProductShippingDetailsSchema, required: true },
    additionalInfo: {
        freeShipping: { type: Boolean, default: false },
        isFeatured: { type: Boolean, default: false },
        isOnSale: { type: Boolean, default: false },
        estimatedDelivery: { type: String },
        returnPolicy: { type: String },
        warranty: { type: String },
        landingPageTemplate: { type: String, default: "template1" },
    },
    seo: { type: ProductSEOSchema },
}, { timestamps: true });
exports.ProductSchema = productSchema;
const ProductModel = (0, mongoose_1.model)("Product", productSchema);
exports.default = ProductModel;
