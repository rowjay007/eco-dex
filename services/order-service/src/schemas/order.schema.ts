import { z } from 'zod';

export const createOrderSchema = z.object({
  body: z.object({
    userId: z.string().uuid(),
    items: z.array(z.object({
      productId: z.string().uuid(),
      quantity: z.number().int().positive(),
      price: z.number().positive()
    })),
    shippingAddress: z.string(),
    billingAddress: z.string(),
    paymentMethod: z.string(),
    status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).default('pending'),
    paymentStatus: z.enum(['pending', 'paid', 'failed']).default('pending')
  })
});

export const updateOrderSchema = z.object({
  body: z.object({
    status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).optional(),
    paymentStatus: z.enum(['pending', 'paid', 'failed']).optional(),
    shippingAddress: z.string().optional(),
    billingAddress: z.string().optional()
  })
});