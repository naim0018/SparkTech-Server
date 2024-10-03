import { Document, Types } from 'mongoose';

interface ProductImage {
  url: string;
  alt: string;
}

interface ProductVariant {
  name: string;
  value: string;
  price?: number; // Added price option
}

interface ProductSpecificationItem {
  name: string;
  value: string;
}

interface ProductSpecification {
  group: string;
  items: ProductSpecificationItem[];
}

interface ProductReview {
  user: string;
  rating: number;
  comment: string;
  date: Date;
}

interface ProductPrice {
  regular: number;
  discounted?: number;
  savings?: number;
  savingsPercentage?: number;
}

interface ProductDimensions {
  length: number;
  width: number;
  height: number;
  unit: 'cm' | 'in';
}


interface AdditionalInfo {
  freeShipping: boolean;
  estimatedDelivery?: string;
  returnPolicy?: string;
  warranty?: string;
}

export interface IProduct extends Document {
  productCode: string;
  title: string;
  brand: string;
  category: string;
  subcategory?: string;
  price: ProductPrice;
  stockStatus: 'In Stock' | 'Out of Stock' | 'Pre-order';
  stockQuantity?: number;
  images: ProductImage[];
  variants: ProductVariant[];
  keyFeatures: string[];
  description: string;
  specifications: ProductSpecification[];
  reviews: ProductReview[];
  rating: {
    average: number;
    count: number;
  };
  relatedProducts: Types.ObjectId[];
  tags: string[];
  paymentOptions: string[];
  weight?: string;
  dimensions?: ProductDimensions;
  additionalInfo?: AdditionalInfo;
  isFeatured: boolean;
  isOnSale: boolean;
}