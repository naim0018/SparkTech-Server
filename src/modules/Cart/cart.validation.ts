import { z } from 'zod';

const cartItemSchema = z.object({
  product: z.string().nonempty(),
  quantity: z.number().int().min(1),
  price: z.number().min(0)
});

const cartSchema = z.object({
  user: z.string().nonempty(),
  items: z.array(cartItemSchema),
  totalAmount: z.number().min(0),
  createdAt: z.date().default(new Date()),
  updatedAt: z.date().default(new Date())
});

const updateCartItemSchema = z.object({
  product: z.string().nonempty().optional(),
  quantity: z.number().int().min(1).optional(),
  price: z.number().min(0).optional()
});

const updateCartSchema = z.object({
  user: z.string().nonempty().optional(),
  items: z.array(updateCartItemSchema).optional(),
  totalAmount: z.number().min(0).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

export const validateCart = {
    cartSchema,
    updateCartSchema
}


