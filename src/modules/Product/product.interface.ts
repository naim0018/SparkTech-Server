import { Document, Types } from 'mongoose';

// Basic Product Information
export interface ProductBasicInfo {
  productCode?: string;
  title: string;
  brand: string;
  category: string;
  subcategory?: string;
  description: string;
  keyFeatures?: string[];
}

// Product Images
export interface ProductImage {
  url: string;
  alt: string;
}

// Product Variants
export interface ProductVariantItem {
  value: string;
  price: number;
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
  selectedVariants?: Record<string, string>;
}

// Product Shipping Details
export interface ProductShippingDetails {
  length: number;
  width: number;
  height: number;
  weight: number;
  dimensionUnit: 'cm' | 'in';
  weightUnit: 'kg' | 'lb';
 
}

// Additional Product Information
export interface AdditionalInfo {
  freeShipping: boolean;
  isFeatured: boolean;
  isOnSale: boolean;
  estimatedDelivery?: string;
  returnPolicy?: string;
  warranty?: string;
}

// Product SEO
export interface ProductSEO {
  metaTitle?: string;
  metaDescription?: string;
  slug?: string;
}

/**
 * Represents a product in the e-commerce system.
 */
export interface IProduct extends Document {
  // Basic Information
  basicInfo: ProductBasicInfo;

  // Pricing and Stock
  price: ProductPrice;
  stockStatus: 'In Stock' | 'Out of Stock' | 'Pre-order';
  stockQuantity?: number;
  sold: number;

  // Product Details
  images: ProductImage[];
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
