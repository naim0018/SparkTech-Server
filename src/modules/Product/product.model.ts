import { model, Schema, Types } from "mongoose";
import { IProduct } from "./product.interface";

const ProductImageSchema = new Schema({
  url: { type: String, required: true },
  alt: { type: String, required: true }
}, { _id: false });

const ProductVariantSchema = new Schema({
  name: { type: String, required: true },
  value: { type: String, required: true }
}, { _id: false });

const ProductSpecificationItemSchema = new Schema({
  name: { type: String, required: true },
  value: { type: String, required: true }
}, { _id: false });

const ProductSpecificationSchema = new Schema({
  group: { type: String, required: true },
  items: [ProductSpecificationItemSchema]
}, { _id: false });

const ProductReviewSchema = new Schema({
  user: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

const ProductPriceSchema = new Schema({
  regular: { type: Number, required: true },
  discounted: { type: Number },
  savings: { type: Number },
  savingsPercentage: { type: Number }
}, { _id: false });

const ProductDimensionsSchema = new Schema({
  length: { type: Number, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  unit: { type: String, enum: ['cm', 'in'], required: true }
}, { _id: false });

const productSchema = new Schema<IProduct>({
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
  relatedProducts: [{ type: Types.ObjectId, ref: 'Product' }],
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
productSchema.pre('save', function(next) {
  if (!this.productCode) {
    next(new Error('Product code is required'));
  } else {
    next();
  }
});

export const ProductModel = model<IProduct>('Product', productSchema);
