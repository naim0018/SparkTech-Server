import { z } from "zod";
import { TProduct,  TShippingDetails, TVariant } from "./product.interface";

// Review Validation Schema
// const reviewSchemaZod = z.object({
//   user: z.string().min(1, { message: "User is required and cannot be empty." }),
//   rating: z.number().min(1, { message: "Rating must be at least 1." }).max(5, { message: "Rating cannot be more than 5." }),
//   comment: z.string().min(1, { message: "Comment is required and cannot be empty." }),
//   date: z.date().default(new Date()),
// });

// Shipping Details Validation Schema
const shippingDetailsSchemaZod = z.object({
  weight: z.number().min(0.1, { message: "Weight must be greater than 0." }),
  dimensions: z.object({
    length: z.number().min(0.1, { message: "Length must be greater than 0." }),
    width: z.number().min(0.1, { message: "Width must be greater than 0." }),
    height: z.number().min(0.1, { message: "Height must be greater than 0." }),
  }),
  freeShipping: z.boolean().default(false),
  estimatedDelivery: z.string().optional(),
});

// Variant Validation Schema
const variantSchemaZod = z.object({
  variantName: z.string().min(1, { message: "Variant name is required and cannot be empty." }),
  options: z.array(z.string()).nonempty({ message: "Options array cannot be empty." }),
});

// Product Validation Schema
const productSchemaZod = z.object({
  body:z.object({
    title: z.string().min(1, { message: "Product title is required." }),
    description: z.record(z.string(), z.string()).optional(),
    price: z.number().min(0, { message: "Price must be a positive number." }),
    discountAmount: z.number().optional(),
    discountPrice: z.number().optional(),
    productCode: z.number().min(1, { message: "Product code must be a positive number." }),
    category: z.string().min(1, { message: "Category is required." }),
    subCategory: z.string().optional(),
    images: z.array(z.string()).nonempty({ message: "Images array cannot be empty." }),
    stockQuantity: z.number().min(0, { message: "Stock quantity must be a non-negative number." }),
    rating: z.number().min(0).max(5).optional(),
    // reviews: z.array(reviewSchemaZod).optional(),
    specifications: z.record(z.string(), z.string()).optional(),
    brand: z.string().optional(),
    tags: z.array(z.string()).optional(),
    isFeatured: z.boolean().default(false),
    isOnSale: z.boolean().default(false),
    shippingDetails: shippingDetailsSchemaZod.optional(),
    variants: z.array(variantSchemaZod).optional(),
  })
})
const updateProductSchemaZod = productSchemaZod.partial().refine(
    (data) => Object.keys(data).length > 0,
    { message: "At least one field must be updated." }
  );
export const ProductZodValidation ={
    productSchemaZod,
    updateProductSchemaZod
}


