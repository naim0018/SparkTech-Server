import { z } from "zod";

const ProductImageSchema = z.object({
  url: z.string().url(),
  alt: z.string()
});

const ProductVariantSchema = z.object({
  name: z.string(),
  value: z.string(),
  price: z.number().positive().optional() // Added price option
});

const ProductSpecificationItemSchema = z.object({
  name: z.string(),
  value: z.string()
});

const ProductSpecificationSchema = z.object({
  group: z.string(),
  items: z.array(ProductSpecificationItemSchema)
});

const ProductReviewSchema = z.object({
  user: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string(),
  date: z.date().default(() => new Date())
});

const ProductPriceSchema = z.object({
  regular: z.number().positive(),
  discounted: z.number().positive().optional(),
  savings: z.number().nonnegative().optional(),
  savingsPercentage: z.number().min(0).max(100).optional()
});

const ProductDimensionsSchema = z.object({
  length: z.number().positive(),
  width: z.number().positive(),
  height: z.number().positive(),
  unit: z.enum(['cm', 'in'])
});

// Remove ManufacturerInfoSchema

const AdditionalInfoSchema = z.object({
  freeShipping: z.boolean().default(false),
  estimatedDelivery: z.string().optional(),
  returnPolicy: z.string().optional(),
  warranty: z.string().optional()
});

const productSchemaZod = z.object({
  body: z.object({
    title: z.string().min(1),
    brand: z.string(),
    category: z.string(),
    subcategory: z.string().optional(),
    price: ProductPriceSchema,
    stockStatus: z.enum(['In Stock', 'Out of Stock', 'Pre-order']),
    stockQuantity: z.number().int().nonnegative().optional(),
    images: z.array(ProductImageSchema).nonempty(),
    variants: z.array(ProductVariantSchema),
    keyFeatures: z.array(z.string()),
    description: z.string(),
    specifications: z.array(ProductSpecificationSchema),
    reviews: z.array(ProductReviewSchema).optional(),
    rating: z.object({
      average: z.number().min(0).max(5).default(0),
      count: z.number().int().nonnegative().default(0)
    }),
    relatedProducts: z.array(z.string()).optional(),
    tags: z.array(z.string()),
    paymentOptions: z.array(z.string()),
    weight: z.string().optional(),
    dimensions: ProductDimensionsSchema.optional(),
    // Remove manufacturerInfo
    additionalInfo: AdditionalInfoSchema.optional(),
    isFeatured: z.boolean().default(false),
    isOnSale: z.boolean().default(false)
  })
});

const updateProductSchemaZod = productSchemaZod.partial().refine(
  (data) => Object.keys(data.body || {}).length > 0,
  { message: "At least one field must be updated." }
);

export const ProductZodValidation = {
  productSchemaZod,
  updateProductSchemaZod
};
