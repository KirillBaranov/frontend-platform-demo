import { z } from 'zod';

/** Vehicle entity — validated at data source boundary. */
export const VehicleSchema = z.object({
  id: z.string(),
  vin: z.string().length(17),
  brand: z.string(),
  model: z.string(),
  year: z.number().int().min(1990).max(2030),
  price: z.number().positive(),
  mileage: z.number().nonnegative(),
  color: z.string(),
  status: z.enum(['in_stock', 'reserved', 'sold']),
  dealerId: z.string(),
  imageUrl: z.string().url().optional(),
  createdAt: z.string().datetime(),
});

export type Vehicle = z.infer<typeof VehicleSchema>;

export const VehicleListSchema = z.array(VehicleSchema);
