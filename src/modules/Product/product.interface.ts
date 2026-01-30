import { Document, Types } from "mongoose";

// Basic Product Information
export interface ProductBasicInfo {
  productCode?: string;
  title: string;
  brand: string;
  category: string;
  subcategory?: string;
  description: string;
  keyFeatures?: string[];
  addDeliveryCharge?: boolean;
  deliveryChargeInsideDhaka?: number;
  deliveryChargeOutsideDhaka?: number;
}

// Product Images
export interface ProductImage {
  url: string;
  alt: string;
}

// Product Videos
export interface ProductVideo {
  url: string;
  title: string;
  thumbnail?: string;
  platform?: "youtube" | "vimeo" | "direct";
}

// Product Variants
export interface ProductVariantItem {
  value: string;
  price?: number;
  stock?: number;
  image?: {
    url?: string;
    alt?: string;
  };
}

export interface ProductVariant {
  group: string;
  items: ProductVariantItem[];
}

// Product Specifications
export interface ProductSpecificationItem {
  name: string;
  value: string;
}

export interface ProductSpecification {
  group: string;
  items: ProductSpecificationItem[];
}

// Product Reviews and Ratings
export interface ProductReview {
  user: string;
  rating: number;
  comment: string;
  date: Date;
}

export interface ProductRating {
  average: number;
  count: number;
}

// Product Pricing
export interface ProductPrice {
  regular: number;
  discounted?: number;
  savings?: number;
  savingsPercentage?: number;
  selectedVariants?: Map<string, string>;
}

// Product Shipping Details
export interface ProductShippingDetails {
  length: number;
  width: number;
  height: number;
  weight: number;
  dimensionUnit: "cm" | "in";
  weightUnit: "kg" | "lb";
}

// Additional Product Information
export interface AdditionalInfo {
  freeShipping: boolean;
  isFeatured: boolean;
  isOnSale: boolean;
  estimatedDelivery?: string;
  returnPolicy?: string;
  warranty?: string;
  landingPageTemplate?: string;
}

// Product SEO
export interface ProductSEO {
  metaTitle?: string;
  metaDescription?: string;
  slug?: string;
}

// Bulk Pricing
export interface BulkPricing {
  minQuantity: number;
  price: number;
}

/**
 * Represents a product in the e-commerce system.
 */
export interface IProduct extends Document {
  // Basic Information
  basicInfo: ProductBasicInfo;

  // Pricing and Stock
  price: ProductPrice;
  bulkPricing?: BulkPricing[];
  stockStatus: "In Stock" | "Out of Stock" | "Pre-order";
  stockQuantity?: number;
  sold: number;

  // Product Details
  images: ProductImage[];
  videos?: ProductVideo[];
  variants?: ProductVariant[];
  specifications?: ProductSpecification[];

  // Reviews and Ratings
  reviews?: ProductReview[];
  rating?: ProductRating;

  // Related Products and Tags
  relatedProducts: Types.ObjectId[];
  tags: string[];

  // Shipping Details
  shippingDetails: ProductShippingDetails;

  // Additional Information
  additionalInfo?: AdditionalInfo;

  // SEO and Categorization
  seo?: ProductSEO;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}
