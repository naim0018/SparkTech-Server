import { z } from "zod";

// Basic Product Information
const ProductBasicInfoSchema = z.object({
  productCode: z.string(),
  title: z.string().min(1),
  brand: z.string(),
  category: z.string(),
  subcategory: z.string().optional(),
  description: z.string(),
  keyFeatures: z.array(z.string())
});

// Product Images
const ProductImageSchema = z.object({
  url: z.string().url(),
  alt: z.string()
});

// Product Variants
const ProductVariantSchema = z.object({
  name: z.string(),
  value: z.string(),
  price: z.number().positive().optional()
});

// Product Specifications
const ProductSpecificationItemSchema = z.object({
  name: z.string(),
  value: z.string()
});

const ProductSpecificationSchema = z.object({
  group: z.string(),
  items: z.array(ProductSpecificationItemSchema)
});

// Product Reviews and Ratings
const ProductReviewSchema = z.object({
  user: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string(),
  date: z.date().default(() => new Date())
});

const ProductRatingSchema = z.object({
  average: z.number().min(0).max(5).default(0),
  count: z.number().int().nonnegative().default(0)
});

// Product Pricing
const ProductPriceSchema = z.object({
  regular: z.number().positive(),
  discounted: z.number().positive().optional(),
  savings: z.number().nonnegative().optional(),
  savingsPercentage: z.number().min(0).max(100).optional()
});

// Product Dimensions and Shipping
const ProductDimensionsSchema = z.object({
  length: z.number().positive(),
  width: z.number().positive(),
  height: z.number().positive(),
  weight: z.number().positive(),
  unit: z.enum(['cm', 'in'])
});

const ProductShippingSchema = z.object({
  shippingWeight: z.number().optional(),
  shippingWeightUnit: z.enum(['kg', 'lb']).optional()
});

// Additional Product Information
const AdditionalInfoSchema = z.object({
  freeShipping: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  isOnSale: z.boolean().default(false),
  estimatedDelivery: z.string().optional(),
  returnPolicy: z.string().optional(),
  warranty: z.string().optional()
});

// Product SEO
const ProductSEOSchema = z.object({
  metaTitle: z.string(),
  metaDescription: z.string(),
  slug: z.string()
});

const productSchemaZod = z.object({
  body: z.object({
    basicInfo: ProductBasicInfoSchema,
    price: ProductPriceSchema,
    stockStatus: z.enum(['In Stock', 'Out of Stock', 'Pre-order']),
    stockQuantity: z.number().int().nonnegative().optional(),
    sold: z.number().int().nonnegative().default(0),
    images: z.array(ProductImageSchema).nonempty(),
    variants: z.array(ProductVariantSchema).optional(),
    specifications: z.array(ProductSpecificationSchema).optional(),
    reviews: z.array(ProductReviewSchema).optional(),
    rating: ProductRatingSchema,
    relatedProducts: z.array(z.string()).optional(),
    tags: z.array(z.string()),
    paymentOptions: z.array(z.string()),
    dimensions: ProductDimensionsSchema.optional(),
    shipping: ProductShippingSchema,
    additionalInfo: AdditionalInfoSchema.optional(),
    seo: ProductSEOSchema.optional()
  })
});

const updateProductSchemaZod = z.object({
  body: productSchemaZod.shape.body.partial()
}).refine(
  (data) => Object.keys(data.body || {}).length > 0,
  { message: "At least one field must be updated." }
);

export const ProductZodValidation = {
  productSchemaZod,
  updateProductSchemaZod
};
