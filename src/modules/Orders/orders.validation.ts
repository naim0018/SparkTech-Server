import { z } from 'zod';

// Selected Variant Schema
const SelectedVariantSchema = z.object({
  value: z.string(),
  price: z.number().nonnegative(),
  quantity: z.number().int().positive().optional(),
  image: z.string().optional()
});

// Order Item Schema
const OrderItemSchema = z.object({
  product: z.union([z.string(), z.number()]),
  quantity: z.number().int().positive(),
  price: z.number().positive(),
  regularPrice: z.number().positive().optional(),
  discountAmount: z.number().nonnegative().optional(),
  image: z.string(),
  itemKey: z.string(),
  selectedVariants: z.record(z.array(SelectedVariantSchema)).optional()
});

// Status History Schema
const StatusHistorySchema = z.object({
  status: z.string(),
  date: z.date().optional(),
  updatedBy: z.string().optional(),
  comment: z.string().optional()
});

// Payment Information Schema
const PaymentInfoSchema = z.object({
  paymentMethod: z.enum(['cash on delivery', 'bkash']).default('cash on delivery'),
  status: z.enum(['pending', 'processing', 'shipped', 'completed', 'cancelled']).default('pending'),
  transactionId: z.string().optional(),
  paymentDate: z.string().optional(),
  amount: z.number().positive(),
  bkashNumber: z.string().optional()
});

// Billing Information Schema
const BillingInformationSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().min(1),
  address: z.string().min(1),
  country: z.string().min(1),
  paymentMethod: z.string().min(1).optional(),
  notes: z.string().optional()
});

// Main Order Schema
// NOTE: Backend calculates subTotal, totalDiscount, deliveryCharge, totalAmount
// Frontend only sends: items, billingInformation, courierCharge, optional paymentInfo/cuponCode
const orderSchemaZod = z.object({
  body: z.object({
    items: z.array(OrderItemSchema).nonempty(),
    billingInformation: BillingInformationSchema,
    courierCharge: z.enum(['insideDhaka', 'outsideDhaka']),
    
    // Optional fields (either frontend sends or backend generates)
    paymentInfo: PaymentInfoSchema.optional(),
    cuponCode: z.string().optional(),
    discount: z.number().nonnegative().optional(),
    
    // Backend-calculated fields (optional in validation, backend will set them)
    orderId: z.string().optional(),
    subTotal: z.number().nonnegative().optional(),
    totalDiscount: z.number().nonnegative().optional(),
    deliveryCharge: z.number().nonnegative().optional(),
    totalAmount: z.number().nonnegative().optional(),
    status: z.string().optional(),
    statusHistory: z.array(StatusHistorySchema).optional(),
    comboInfo: z.string().optional(),
    consignment_id: z.string().optional()
  })
});

const updateOrderSchemaZod = z.object({
  body: orderSchemaZod.shape.body.partial()
}).refine(
  (data) => Object.keys(data.body || {}).length > 0,
  { message: "At least one field must be updated." }
);

export const OrderZodValidation = {
  orderSchemaZod,
  updateOrderSchemaZod
};
