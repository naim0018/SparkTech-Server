import { z } from 'zod';

// Order Item Schema
const OrderItemSchema = z.object({
  product: z.union([z.string(), z.number()]),
  quantity: z.number().int().positive(),
  price: z.number().positive()
});

// Billing Information Schema
const BillingInformationSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  streetAddress: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zipCode: z.string().min(1),
  country: z.string().min(1),
  paymentMethod: z.string().min(1),
  cardNumber: z.string().optional(),
  expMonth: z.string().optional(),
  expYear: z.string().optional(),
  cvv: z.string().optional(),
  notes: z.string().optional()
});

// Main Order Schema
const orderSchemaZod = z.object({
  body: z.object({
    items: z.array(OrderItemSchema).nonempty(),
    totalAmount: z.number().nonnegative(),
    status: z.string().min(1),
    billingInformation: BillingInformationSchema
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
