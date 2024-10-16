"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductZodValidation = void 0;
const zod_1 = require("zod");
const ProductImageSchema = zod_1.z.object({
    url: zod_1.z.string().url(),
    alt: zod_1.z.string()
});
const ProductVariantSchema = zod_1.z.object({
    name: zod_1.z.string(),
    value: zod_1.z.string(),
    price: zod_1.z.number().positive().optional()
});
const ProductSpecificationItemSchema = zod_1.z.object({
    name: zod_1.z.string(),
    value: zod_1.z.string()
});
const ProductSpecificationSchema = zod_1.z.object({
    group: zod_1.z.string(),
    items: zod_1.z.array(ProductSpecificationItemSchema)
});
const ProductReviewSchema = zod_1.z.object({
    user: zod_1.z.string(),
    rating: zod_1.z.number().min(1).max(5),
    comment: zod_1.z.string(),
    date: zod_1.z.date().default(() => new Date())
});
const ProductPriceSchema = zod_1.z.object({
    regular: zod_1.z.number().positive(),
    discounted: zod_1.z.number().positive().optional(),
    savings: zod_1.z.number().nonnegative().optional(),
    savingsPercentage: zod_1.z.number().min(0).max(100).optional()
});
const ProductDimensionsSchema = zod_1.z.object({
    length: zod_1.z.number().positive(),
    width: zod_1.z.number().positive(),
    height: zod_1.z.number().positive(),
    unit: zod_1.z.enum(['cm', 'in'])
});
const AdditionalInfoSchema = zod_1.z.object({
    freeShipping: zod_1.z.boolean().default(false),
    estimatedDelivery: zod_1.z.string().optional(),
    returnPolicy: zod_1.z.string().optional(),
    warranty: zod_1.z.string().optional()
});
const productSchemaZod = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(1),
        brand: zod_1.z.string(),
        category: zod_1.z.string(),
        subcategory: zod_1.z.string().optional(),
        price: ProductPriceSchema,
        stockStatus: zod_1.z.enum(['In Stock', 'Out of Stock', 'Pre-order']),
        stockQuantity: zod_1.z.number().int().nonnegative().optional(),
        images: zod_1.z.array(ProductImageSchema).nonempty(),
        variants: zod_1.z.array(ProductVariantSchema).optional(),
        keyFeatures: zod_1.z.array(zod_1.z.string()),
        description: zod_1.z.string(),
        specifications: zod_1.z.array(ProductSpecificationSchema),
        reviews: zod_1.z.array(ProductReviewSchema).optional(),
        rating: zod_1.z.object({
            average: zod_1.z.number().min(0).max(5).default(0),
            count: zod_1.z.number().int().nonnegative().default(0)
        }),
        relatedProducts: zod_1.z.array(zod_1.z.string()).optional(),
        tags: zod_1.z.array(zod_1.z.string()),
        paymentOptions: zod_1.z.array(zod_1.z.string()),
        weight: zod_1.z.string().optional(),
        dimensions: ProductDimensionsSchema.optional(),
        additionalInfo: AdditionalInfoSchema.optional(),
        isFeatured: zod_1.z.boolean().default(false),
        isOnSale: zod_1.z.boolean().default(false)
    })
});
const updateProductSchemaZod = zod_1.z.object({
    body: productSchemaZod.shape.body.partial()
}).refine((data) => Object.keys(data.body || {}).length > 0, { message: "At least one field must be updated." });
exports.ProductZodValidation = {
    productSchemaZod,
    updateProductSchemaZod
};
