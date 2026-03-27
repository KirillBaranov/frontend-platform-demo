import { z } from 'zod';

/** Order entity — validated at data source boundary. */
export const OrderSchema = z.object({
  id: z.string(),
  vehicleId: z.string(),
  customerName: z.string(),
  customerPhone: z.string().optional(),
  totalPrice: z.number().positive(),
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']),
  dealerId: z.string(),
  managerId: z.string().optional(),
  tradeInVehicleId: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Order = z.infer<typeof OrderSchema>;

export const OrderListSchema = z.array(OrderSchema);
