import { z } from "zod";

const ZodSubCategory = z.object({
    name: z.string().min(3).max(50),
    image: z.string().min(3).max(50).optional(),
    description: z.string().min(3).max(50).optional(),
});

const ZodCategory = z.object({
    name: z.string().min(3).max(50),
    image: z.string().min(3).max(50).optional(),
    description: z.string().min(3).max(50).optional(),
    order: z.number().optional(),
    subCategories: z.array(ZodSubCategory).optional(),
});

export { ZodCategory, ZodSubCategory };
