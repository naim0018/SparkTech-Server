"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderZodValidation = void 0;
const zod_1 = require("zod");
// Selected Variant Schema
const SelectedVariantSchema = zod_1.z.object({
    value: zod_1.z.string(),
    price: zod_1.z.number().nonnegative(),
    quantity: zod_1.z.number().int().positive().optional(),
    image: zod_1.z.string().optional()
});
// Order Item Schema
const OrderItemSchema = zod_1.z.object({
    product: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]),
    quantity: zod_1.z.number().int().positive(),
    price: zod_1.z.number().positive(),
    regularPrice: zod_1.z.number().positive().optional(),
    discountAmount: zod_1.z.number().nonnegative().optional(),
    image: zod_1.z.string(),
    itemKey: zod_1.z.string(),
    selectedVariants: zod_1.z.record(zod_1.z.array(SelectedVariantSchema)).optional()
});
// Status History Schema
const StatusHistorySchema = zod_1.z.object({
    status: zod_1.z.string(),
    date: zod_1.z.date().optional(),
    updatedBy: zod_1.z.string().optional(),
    comment: zod_1.z.string().optional()
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
    paymentMethod: zod_1.z.string().min(1).optional(),
    notes: zod_1.z.string().optional()
});
// Main Order Schema
// NOTE: Backend calculates subTotal, totalDiscount, deliveryCharge, totalAmount
// Frontend only sends: items, billingInformation, courierCharge, optional paymentInfo/cuponCode
const orderSchemaZod = zod_1.z.object({
    body: zod_1.z.object({
        items: zod_1.z.array(OrderItemSchema).nonempty(),
        billingInformation: BillingInformationSchema,
        courierCharge: zod_1.z.enum(['insideDhaka', 'outsideDhaka']),
        // Optional fields (either frontend sends or backend generates)
        paymentInfo: PaymentInfoSchema.optional(),
        cuponCode: zod_1.z.string().optional(),
        discount: zod_1.z.number().nonnegative().optional(),
        // Backend-calculated fields (optional in validation, backend will set them)
        orderId: zod_1.z.string().optional(),
        subTotal: zod_1.z.number().nonnegative().optional(),
        totalDiscount: zod_1.z.number().nonnegative().optional(),
        deliveryCharge: zod_1.z.number().nonnegative().optional(),
        totalAmount: zod_1.z.number().nonnegative().optional(),
        status: zod_1.z.string().optional(),
        statusHistory: zod_1.z.array(StatusHistorySchema).optional(),
        comboInfo: zod_1.z.string().optional(),
        consignment_id: zod_1.z.string().optional()
    })
});
const updateOrderSchemaZod = zod_1.z.object({
    body: orderSchemaZod.shape.body.partial()
}).refine((data) => Object.keys(data.body || {}).length > 0, { message: "At least one field must be updated." });
exports.OrderZodValidation = {
    orderSchemaZod,
    updateOrderSchemaZod
};
