import { model, Schema, Types } from "mongoose";
import { IProduct } from "./product.interface";

const ProductImageSchema = new Schema(
  {
    url: { type: String, required: true },
    alt: { type: String, required: true },
  },
  { _id: false }
);

const ProductVariantItemSchema = new Schema(
  {
    value: { type: String, required: true },
    price: { type: Number },
    stock: { type: Number },
    image: {
      url: { type: String },
      alt: { type: String },
    },
  },
  { _id: false }
);

const ProductVariantSchema = new Schema(
  {
    group: { type: String, required: true },
    items: [ProductVariantItemSchema],
  },
  { _id: false }
);

const ProductSpecificationItemSchema = new Schema(
  {
    name: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false }
);

const ProductSpecificationSchema = new Schema(
  {
    group: { type: String, required: true },
    items: [ProductSpecificationItemSchema],
  },
  { _id: false }
);

const ProductReviewSchema = new Schema({
  user: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

const ProductPriceSchema = new Schema(
  {
    regular: { type: Number, required: true },
    discounted: { type: Number },
    savings: { type: Number },
    savingsPercentage: { type: Number },
    selectedVariants: { type: Map, of: String },
  },
  { _id: false }
);

const ProductShippingDetailsSchema = new Schema(
  {
    length: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    weight: { type: Number, required: true },
    dimensionUnit: { type: String, enum: ["cm", "in"], required: true },
    weightUnit: { type: String, enum: ["kg", "lb"], required: true },
  },
  { _id: false }
);

const ProductSEOSchema = new Schema(
  {
    metaTitle: { type: String },
    metaDescription: { type: String },
    slug: { type: String, sparse: true },
  },
  { _id: false }
);

const ProductBasicInfoSchema = new Schema(
  {
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
  },
  { _id: false }
);

const productSchema = new Schema<IProduct>(
  {
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    basicInfo: { type: ProductBasicInfoSchema, required: true },
    price: { type: ProductPriceSchema, required: true },
    stockStatus: {
      type: String,
      enum: ["In Stock", "Out of Stock", "Pre-order"],
      required: true,
    },
    stockQuantity: { type: Number },
    sold: { type: Number, default: 0 },
    images: { type: [ProductImageSchema], required: true },
    variants: [ProductVariantSchema],
    specifications: [ProductSpecificationSchema],
    reviews: [ProductReviewSchema],
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    relatedProducts: [{ type: Types.ObjectId, ref: "Product" }],
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
  },
  { timestamps: true }
);

const ProductModel = model<IProduct>("Product", productSchema);

export default ProductModel;
