import { model, Schema } from "mongoose";
import { TProduct, TShippingDetails, TVariant } from "./product.interface";



// const reviewSchema = new Schema<TReview>({
//   user: { type: String, required: true },      // Name or ID of the user who wrote the review
//   rating: { type: Number, required: true },    // Rating given by the user
//   comment: { type: String, required: true },   // Review comment
//   date: { type: Date, default: Date.now },     // Date when the review was submitted
// });

const shippingDetailsSchema = new Schema<TShippingDetails>({
  weight: { type: Number, required: true },    // Weight of the product (in grams, kilograms, etc.)
  dimensions: {
    length: { type: Number, required: true },  // Length of the product
    width: { type: Number, required: true },   // Width of the product
    height: { type: Number, required: true },  // Height of the product
  },
  freeShipping: { type: Boolean, default: false },  // Whether the product qualifies for free shipping
  estimatedDelivery: { type: String },          // Estimated delivery time
},{_id:false});

const variantSchema = new Schema<TVariant>({
  variantName: { type: String, required: true }, // Name of the variant (e.g., "Size", "Color")
  options: { type: [String], required: true },   // Options available for the variant (e.g., ["S", "M", "L"])
},{_id:false});

const productSchema = new Schema<TProduct>({
  title: { type: String, required: true },     // The name of the product
  description: { type: Map, of: String },      // Key-value pairs for product details
  price: { type: Number, required: true },     // Base price of the product
  discountAmount: { type: Number },            // Amount of discount applied
  discountPrice: { type: Number },             // Price after discount
  productCode: { type: Number, required: true, unique: true }, // Unique identifier for the product (SKU, UPC, etc.)
  category: { type: String, required: true },  // Category to which the product belongs
  subCategory: { type: String },               // Optional subcategory for more specific classification
  images: { type: [String], required: true },  // Array of image URLs for the product
  stockQuantity: { type: Number, required: true }, // Number of units available in stock
  rating: { type: Number },                    // Average rating of the product
  // reviews: [reviewSchema],                     // Array of customer reviews
  specifications: { type: Map, of: String },   // Detailed technical specifications
  brand: { type: String },                     // Brand name (if applicable)
  tags: { type: [String] },                    // Tags or keywords associated with the product
  isFeatured: { type: Boolean, default: false }, // Whether the product is featured on the website
  isOnSale: { type: Boolean, default: false }, // Whether the product is on sale
  shippingDetails: shippingDetailsSchema,      // Shipping information like weight, dimensions, etc.
  variants: [variantSchema],                   // Different variants of the product (e.g., size, color)
},{timestamps:true});

// Creating the Product model
export const ProductModel = model<TProduct>('Product', productSchema);


