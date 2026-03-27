import { z } from 'zod';

/** Dashboard statistics — aggregated from multiple sources. */
export const DashboardStatsSchema = z.object({
  totalVehicles: z.number().nonnegative(),
  vehiclesInStock: z.number().nonnegative(),
  vehiclesReserved: z.number().nonnegative(),
  vehiclesSold: z.number().nonnegative(),

  totalOrders: z.number().nonnegative(),
  pendingOrders: z.number().nonnegative(),
  completedOrders: z.number().nonnegative(),

  revenue: z.number().nonnegative(),
  averageOrderValue: z.number().nonnegative(),

  topBrands: z.array(
    z.object({
      brand: z.string(),
      count: z.number(),
    }),
  ),

  recentOrders: z.array(
    z.object({
      id: z.string(),
      customerName: z.string(),
      vehicleBrand: z.string(),
      vehicleModel: z.string(),
      totalPrice: z.number(),
      status: z.string(),
      createdAt: z.string().datetime(),
    }),
  ),

  updatedAt: z.string().datetime(),
});

export type DashboardStats = z.infer<typeof DashboardStatsSchema>;
