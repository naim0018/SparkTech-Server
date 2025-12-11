"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductZodValidation = void 0;
const zod_1 = require("zod");
// Basic Product Information
const ProductBasicInfoSchema = zod_1.z.object({
    productCode: zod_1.z.string().optional(),
    title: zod_1.z.string().min(1),
    brand: zod_1.z.string(),
    category: zod_1.z.string(),
    subcategory: zod_1.z.string().optional(),
    description: zod_1.z.string(),
    keyFeatures: zod_1.z.array(zod_1.z.string()).optional()
});
// Product Images
const ProductImageSchema = zod_1.z.object({
    url: zod_1.z.string().url(),
    alt: zod_1.z.string()
});
// Product Variants
const ProductVariantItemSchema = zod_1.z.object({
    value: zod_1.z.string(),
    price: zod_1.z.number().optional(),
    stock: zod_1.z.number().optional(),
    image: zod_1.z.object({
        url: zod_1.z.string().optional(),
        alt: zod_1.z.string().optional()
    }).optional()
});
const ProductVariantSchema = zod_1.z.object({
    group: zod_1.z.string(),
    items: zod_1.z.array(ProductVariantItemSchema)
});
// Product Specifications
const ProductSpecificationItemSchema = zod_1.z.object({
    name: zod_1.z.string(),
    value: zod_1.z.string()
});
const ProductSpecificationSchema = zod_1.z.object({
    group: zod_1.z.string(),
    items: zod_1.z.array(ProductSpecificationItemSchema)
});
// Product Reviews and Ratings
const ProductReviewSchema = zod_1.z.object({
    user: zod_1.z.string(),
    rating: zod_1.z.number().min(1).max(5),
    comment: zod_1.z.string(),
    date: zod_1.z.date().default(() => new Date())
});
const ProductRatingSchema = zod_1.z.object({
    average: zod_1.z.number().min(0).max(5).default(0),
    count: zod_1.z.number().int().nonnegative().default(0)
});
// Product Pricing
const ProductPriceSchema = zod_1.z.object({
    regular: zod_1.z.number().positive(),
    discounted: zod_1.z.number().optional(),
    savings: zod_1.z.number().optional(),
    savingsPercentage: zod_1.z.number().optional(),
    selectedVariants: zod_1.z.record(zod_1.z.string()).optional()
});
// Product Shipping Details
const ProductShippingDetailsSchema = zod_1.z.object({
    length: zod_1.z.number().positive(),
    width: zod_1.z.number().positive(),
    height: zod_1.z.number().positive(),
    weight: zod_1.z.number().positive(),
    dimensionUnit: zod_1.z.enum(['cm', 'in']),
    weightUnit: zod_1.z.enum(['kg', 'lb'])
});
// Additional Product Information
const AdditionalInfoSchema = zod_1.z.object({
    freeShipping: zod_1.z.boolean().default(false),
    isFeatured: zod_1.z.boolean().default(false),
    isOnSale: zod_1.z.boolean().default(false),
    estimatedDelivery: zod_1.z.string().optional(),
    returnPolicy: zod_1.z.string().optional(),
    warranty: zod_1.z.string().optional()
});
// Product SEO
const ProductSEOSchema = zod_1.z.object({
    metaTitle: zod_1.z.string().optional(),
    metaDescription: zod_1.z.string().optional(),
    slug: zod_1.z.string().optional()
});
const productSchemaZod = zod_1.z.object({
    body: zod_1.z.object({
        basicInfo: ProductBasicInfoSchema,
        price: ProductPriceSchema,
        stockStatus: zod_1.z.enum(['In Stock', 'Out of Stock', 'Pre-order']),
        stockQuantity: zod_1.z.number().int().nonnegative().optional(),
        sold: zod_1.z.number().int().nonnegative().default(0),
        images: zod_1.z.array(ProductImageSchema).nonempty(),
        variants: zod_1.z.array(ProductVariantSchema).optional(),
        specifications: zod_1.z.array(ProductSpecificationSchema).optional(),
        reviews: zod_1.z.array(ProductReviewSchema).optional(),
        rating: ProductRatingSchema.optional(),
        relatedProducts: zod_1.z.array(zod_1.z.string()).optional(),
        tags: zod_1.z.array(zod_1.z.string()),
        shippingDetails: ProductShippingDetailsSchema,
        additionalInfo: AdditionalInfoSchema.optional(),
        seo: ProductSEOSchema.optional()
    })
});
const updateProductSchemaZod = zod_1.z.object({
    body: productSchemaZod.shape.body.partial()
}).refine((data) => Object.keys(data.body || {}).length > 0, { message: "At least one field must be updated." });
exports.ProductZodValidation = {
    productSchemaZod,
    updateProductSchemaZod
};
