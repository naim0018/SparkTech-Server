import { z } from 'zod';

// Order Item Schema
const SelectedVariantSchema = z.object({
  value: z.string().optional(),
  price: z.number().nonnegative().optional()
});

const OrderItemSchema = z.object({
  product: z.union([z.string(), z.number()]),
  quantity: z.number().int().positive(),
  price: z.number().positive(),
  image: z.string(),
  itemKey: z.string(),
  selectedVariants: z.record(SelectedVariantSchema).optional()
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
  paymentMethod: z.string().min(1),
  notes: z.string().optional()
});

// Main Order Schema
const orderSchemaZod = z.object({
  body: z.object({
    items: z.array(OrderItemSchema).nonempty(),
    totalAmount: z.number().nonnegative(),
    status: z.string().min(1),
    billingInformation: BillingInformationSchema,
    paymentInfo: PaymentInfoSchema.optional(),
    courierCharge: z.enum(['insideDhaka', 'outsideDhaka']),
    cuponCode: z.string().optional()
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
