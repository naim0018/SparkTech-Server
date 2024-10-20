import { model, Schema, Types } from "mongoose";
import { IProduct, ProductVariant } from "./product.interface";

const ProductImageSchema = new Schema({
  url: { type: String, required: true },
  alt: { type: String, required: true }
}, { _id: false });

const ProductVariantSchema = new Schema({
  name: { type: String, required: true },
  value: { type: String, required: true },
  price: { type: Number, required: true }
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
  savingsPercentage: { type: Number },
  selectedVariant: { type: String }
}, { _id: false });

const ProductDimensionsSchema = new Schema({
  length: { type: Number, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  unit: { type: String, enum: ['cm', 'in'], required: true }
}, { _id: false });

const ProductShippingSchema = new Schema({
  shippingWeight: { type: Number },
  shippingWeightUnit: { type: String, enum: ['kg', 'lb'] }
}, { _id: false });

const ProductSEOSchema = new Schema({
  metaTitle: { type: String, required: true },
  metaDescription: { type: String, required: true },
  slug: { type: String, required: true, unique: true }
}, { _id: false });

const ProductBasicInfoSchema = new Schema({
  productCode: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  brand: { type: String, required: true },
  category: { type: String, required: true },
  subcategory: { type: String },
  description: { type: String, required: true },
  keyFeatures: [{ type: String }]
}, { _id: false });

const productSchema = new Schema<IProduct>({
  basicInfo: ProductBasicInfoSchema,
  price: ProductPriceSchema,
  stockStatus: { 
    type: String, 
    enum: ['In Stock', 'Out of Stock', 'Pre-order'],
    required: true 
  },
  stockQuantity: { type: Number },
  sold: { type: Number, default: 0 },
  images: [ProductImageSchema],
  variants: [ProductVariantSchema],
  specifications: [ProductSpecificationSchema],
  reviews: [ProductReviewSchema],
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  relatedProducts: [{ type: Types.ObjectId, ref: 'Product' }],
  tags: [{ type: String }],
  paymentOptions: [{ type: String }],
  dimensions: ProductDimensionsSchema,
  shipping: ProductShippingSchema,
  additionalInfo: {
    freeShipping: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    isOnSale: { type: Boolean, default: false },
    estimatedDelivery: { type: String },
    returnPolicy: { type: String },
    warranty: { type: String }
  },
  seo: ProductSEOSchema
}, { timestamps: true });

// Indexes for improved query performance
productSchema.index({ 'basicInfo.productCode': 1 });
productSchema.index({ 'basicInfo.title': 'text', });
productSchema.index({ 'basicInfo.category': 1, 'basicInfo.subcategory': 1 });
productSchema.index({ 'price.regular': 1, 'price.discounted': 1 });
productSchema.index({ stockStatus: 1 });

// Pre-save hook to ensure productCode is provided
productSchema.pre('save', function(next) {
  if (!this.basicInfo.productCode) {
    next(new Error('Product code is required'));
  } else {
    next();
  }
});

// Pre-save hook to calculate savings and savingsPercentage
productSchema.pre('save', function(next) {
  if (this.price.regular && this.price.discounted) {
    this.price.savings = this.price.regular - this.price.discounted;
    this.price.savingsPercentage = (this.price.savings / this.price.regular) * 100;
  }

  // Update price if a variant is selected
  if (this.price.selectedVariant) {
    const selectedVariant = this?.variants?.find((v: ProductVariant) => v.value === this.price.selectedVariant);
    if (selectedVariant) {
      this.price.discounted = selectedVariant.price;
      this.price.savings = this.price.regular - this.price.discounted;
      this.price.savingsPercentage = (this.price.savings / this.price.regular) * 100;
    }
  }

  next();
});

// Pre-save hook to update rating average
productSchema.pre('save', function(next) {
  if (this.reviews.length > 0) {
    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.rating.average = totalRating / this.reviews.length;
    this.rating.count = this.reviews.length;
  }
  next();
});

// Pre-save hook to find related products based on the same category
productSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('basicInfo.subcategory')) {
    try {
      const relatedProducts = await ProductModel.find({
        'basicInfo.subcategory': this.basicInfo.subcategory,
        _id: { $ne: this._id }
      })
      .select('_id')
      .limit(4)
      .lean();

      this.relatedProducts = relatedProducts.map(product => product._id as Types.ObjectId);
    } catch (error) {
      return next(error as Error);
    }
  }
  next();
});

export const ProductModel = model<IProduct>('Product', productSchema);
