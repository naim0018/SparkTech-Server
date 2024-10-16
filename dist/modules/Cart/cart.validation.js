"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCart = void 0;
const zod_1 = require("zod");
const cartItemSchema = zod_1.z.object({
    product: zod_1.z.string().nonempty(),
    quantity: zod_1.z.number().int().min(1),
    price: zod_1.z.number().min(0)
});
const cartSchema = zod_1.z.object({
    user: zod_1.z.string().nonempty(),
    items: zod_1.z.array(cartItemSchema),
    totalAmount: zod_1.z.number().min(0),
    createdAt: zod_1.z.date().default(new Date()),
    updatedAt: zod_1.z.date().default(new Date())
});
const updateCartItemSchema = zod_1.z.object({
    product: zod_1.z.string().nonempty().optional(),
    quantity: zod_1.z.number().int().min(1).optional(),
    price: zod_1.z.number().min(0).optional()
});
const updateCartSchema = zod_1.z.object({
    user: zod_1.z.string().nonempty().optional(),
    items: zod_1.z.array(updateCartItemSchema).optional(),
    totalAmount: zod_1.z.number().min(0).optional(),
    createdAt: zod_1.z.date().optional(),
    updatedAt: zod_1.z.date().optional()
});
exports.validateCart = {
    cartSchema,
    updateCartSchema
};
