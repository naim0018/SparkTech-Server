"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZodSubCategory = exports.ZodCategory = void 0;
const zod_1 = require("zod");
const ZodSubCategory = zod_1.z.object({
    name: zod_1.z.string().min(3).max(50),
    image: zod_1.z.string().min(3).max(50).optional(),
    description: zod_1.z.string().min(3).max(50).optional(),
});
exports.ZodSubCategory = ZodSubCategory;
const ZodCategory = zod_1.z.object({
    name: zod_1.z.string().min(3).max(50),
    image: zod_1.z.string().min(3).max(50).optional(),
    description: zod_1.z.string().min(3).max(50).optional(),
    order: zod_1.z.number().optional(),
    subCategories: zod_1.z.array(ZodSubCategory).optional(),
});
exports.ZodCategory = ZodCategory;
