"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderZodValidation = void 0;
const zod_1 = require("zod");
// Order Item Schema
const SelectedVariantSchema = zod_1.z.object({
    value: zod_1.z.string().optional(),
    price: zod_1.z.number().nonnegative().optional()
});
const OrderItemSchema = zod_1.z.object({
    product: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]),
    quantity: zod_1.z.number().int().positive(),
    price: zod_1.z.number().positive(),
    image: zod_1.z.string(),
    itemKey: zod_1.z.string(),
    selectedVariants: zod_1.z.record(SelectedVariantSchema).optional()
});
// Payment Information Schema
const PaymentInfoSchema = zod_1.z.object({
    paymentMethod: zod_1.z.enum(['cash on delivery', 'bkash']).default('cash on delivery'),
    status: zod_1.z.enum(['pending', 'processing', 'shipped', 'completed', 'cancelled']).default('pending'),
    transactionId: zod_1.z.string().optional(),
    paymentDate: zod_1.z.string().optional(),
    amount: zod_1.z.number().positive(),
    bkashNumber: zod_1.z.string().optional()
});
// Billing Information Schema
const BillingInformationSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    email: zod_1.z.string().email().optional(),
    phone: zod_1.z.string().min(1),
    address: zod_1.z.string().min(1),
    country: zod_1.z.string().min(1),
    paymentMethod: zod_1.z.string().min(1),
    notes: zod_1.z.string().optional()
});
// Main Order Schema
const orderSchemaZod = zod_1.z.object({
    body: zod_1.z.object({
        items: zod_1.z.array(OrderItemSchema).nonempty(),
        totalAmount: zod_1.z.number().nonnegative(),
        status: zod_1.z.string().min(1),
        billingInformation: BillingInformationSchema,
        paymentInfo: PaymentInfoSchema.optional(),
        courierCharge: zod_1.z.enum(['insideDhaka', 'outsideDhaka']),
        cuponCode: zod_1.z.string().optional()
    })
});
const updateOrderSchemaZod = zod_1.z.object({
    body: orderSchemaZod.shape.body.partial()
}).refine((data) => Object.keys(data.body || {}).length > 0, { message: "At least one field must be updated." });
exports.OrderZodValidation = {
    orderSchemaZod,
    updateOrderSchemaZod
};
