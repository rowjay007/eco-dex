import { z } from 'zod';

export const createShipmentSchema = z.object({
  body: z.object({
    orderId: z.string().uuid(),
    carrier: z.string(),
    trackingNumber: z.string(),
    estimatedDeliveryDate: z.string().datetime(),
    status: z.enum(['pending', 'in_transit', 'delivered', 'failed']).default('pending'),
    shippingAddress: z.string(),
    recipientName: z.string(),
    recipientPhone: z.string()
  })
});

export const updateShipmentSchema = z.object({
  body: z.object({
    carrier: z.string().optional(),
    trackingNumber: z.string().optional(),
    estimatedDeliveryDate: z.string().datetime().optional(),
    status: z.enum(['pending', 'in_transit', 'delivered', 'failed']).optional(),
    shippingAddress: z.string().optional(),
    recipientName: z.string().optional(),
    recipientPhone: z.string().optional()
  })
});