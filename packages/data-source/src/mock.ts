/**
 * Mock data source — works without network.
 *
 * Used for: GitHub Pages, CI tests, offline development, demos.
 * Realistic auto-domain data: vehicles, orders, dashboard stats.
 */

import type { Vehicle, Order, DashboardStats } from '@platform/contracts';
import type {
  DataSource,
  IVehicleSource,
  IOrderSource,
  IDashboardSource,
  VehicleFilters,
  CreateOrderInput,
} from './types.js';

// ---------------------------------------------------------------------------
// Mock data — realistic automotive domain
// ---------------------------------------------------------------------------

const VEHICLES: Vehicle[] = [
  {
    id: 'v-001', vin: 'WBA11AA0X0CK12345', brand: 'BMW', model: '320d',
    year: 2024, price: 4_200_000, mileage: 0, color: 'Серебристый',
    status: 'in_stock', dealerId: 'dealer-1', createdAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'v-002', vin: 'WVWZZZ3CZWE123456', brand: 'Volkswagen', model: 'Tiguan',
    year: 2025, price: 3_800_000, mileage: 0, color: 'Белый',
    status: 'in_stock', dealerId: 'dealer-1', createdAt: '2026-02-01T09:00:00Z',
  },
  {
    id: 'v-003', vin: 'JTDKN3DU5A0123456', brand: 'Toyota', model: 'Camry',
    year: 2024, price: 3_500_000, mileage: 12_000, color: 'Чёрный',
    status: 'reserved', dealerId: 'dealer-1', createdAt: '2025-11-20T14:30:00Z',
  },
  {
    id: 'v-004', vin: 'XWEPH81ABP0012345', brand: 'Hyundai', model: 'Tucson',
    year: 2025, price: 3_200_000, mileage: 0, color: 'Синий',
    status: 'in_stock', dealerId: 'dealer-2', createdAt: '2026-03-01T08:00:00Z',
  },
  {
    id: 'v-005', vin: 'WMEEJ9AA1E0123456', brand: 'Mercedes-Benz', model: 'E-Class',
    year: 2023, price: 5_900_000, mileage: 25_000, color: 'Серый',
    status: 'sold', dealerId: 'dealer-1', createdAt: '2025-06-10T11:00:00Z',
  },
  {
    id: 'v-006', vin: 'KNAGH41E59A123456', brand: 'Kia', model: 'Sportage',
    year: 2025, price: 2_900_000, mileage: 0, color: 'Красный',
    status: 'in_stock', dealerId: 'dealer-2', createdAt: '2026-03-10T10:00:00Z',
  },
  {
    id: 'v-007', vin: 'WAUZZZ4G9FN123456', brand: 'Audi', model: 'A4',
    year: 2024, price: 4_500_000, mileage: 8_000, color: 'Белый',
    status: 'in_stock', dealerId: 'dealer-1', createdAt: '2025-12-05T15:00:00Z',
  },
  {
    id: 'v-008', vin: 'SJNFAAE11U2123456', brand: 'Nissan', model: 'X-Trail',
    year: 2025, price: 3_100_000, mileage: 0, color: 'Зелёный',
    status: 'reserved', dealerId: 'dealer-2', createdAt: '2026-02-20T12:00:00Z',
  },
];

let orders: Order[] = [
  {
    id: 'o-001', vehicleId: 'v-003', customerName: 'Алексей Смирнов',
    customerPhone: '+7 (999) 123-45-67', totalPrice: 3_500_000,
    status: 'confirmed', dealerId: 'dealer-1', managerId: 'user-1',
    createdAt: '2026-03-20T14:00:00Z', updatedAt: '2026-03-21T10:00:00Z',
  },
  {
    id: 'o-002', vehicleId: 'v-005', customerName: 'Мария Козлова',
    totalPrice: 5_900_000, status: 'completed', dealerId: 'dealer-1',
    managerId: 'user-1',
    createdAt: '2026-02-15T11:00:00Z', updatedAt: '2026-03-01T09:00:00Z',
  },
  {
    id: 'o-003', vehicleId: 'v-008', customerName: 'Дмитрий Волков',
    customerPhone: '+7 (916) 987-65-43', totalPrice: 3_100_000,
    status: 'pending', dealerId: 'dealer-2',
    createdAt: '2026-03-25T16:00:00Z', updatedAt: '2026-03-25T16:00:00Z',
  },
];

let nextOrderId = 4;

// ---------------------------------------------------------------------------
// Mock implementations
// ---------------------------------------------------------------------------

const vehicleSource: IVehicleSource = {
  async getAll(filters?: VehicleFilters): Promise<Vehicle[]> {
    await delay(200); // simulate network

    let result = [...VEHICLES];
    if (filters?.brand) {
      result = result.filter((v) => v.brand === filters.brand);
    }
    if (filters?.yearFrom) {
      result = result.filter((v) => v.year >= filters.yearFrom!);
    }
    if (filters?.yearTo) {
      result = result.filter((v) => v.year <= filters.yearTo!);
    }
    if (filters?.priceFrom) {
      result = result.filter((v) => v.price >= filters.priceFrom!);
    }
    if (filters?.priceTo) {
      result = result.filter((v) => v.price <= filters.priceTo!);
    }
    if (filters?.status) {
      result = result.filter((v) => v.status === filters.status);
    }
    if (filters?.dealerId) {
      result = result.filter((v) => v.dealerId === filters.dealerId);
    }
    return result;
  },

  async getById(id: string): Promise<Vehicle | null> {
    await delay(100);
    return VEHICLES.find((v) => v.id === id) ?? null;
  },
};

const orderSource: IOrderSource = {
  async getAll(): Promise<Order[]> {
    await delay(200);
    return [...orders];
  },

  async getById(id: string): Promise<Order | null> {
    await delay(100);
    return orders.find((o) => o.id === id) ?? null;
  },

  async create(data: CreateOrderInput): Promise<Order> {
    await delay(300);
    const order: Order = {
      id: `o-${String(nextOrderId++).padStart(3, '0')}`,
      vehicleId: data.vehicleId,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      totalPrice: data.totalPrice,
      status: 'pending',
      dealerId: 'dealer-1',
      managerId: 'user-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    orders = [...orders, order];
    return order;
  },
};

const dashboardSource: IDashboardSource = {
  async getStats(): Promise<DashboardStats> {
    await delay(300);

    const inStock = VEHICLES.filter((v) => v.status === 'in_stock').length;
    const reserved = VEHICLES.filter((v) => v.status === 'reserved').length;
    const sold = VEHICLES.filter((v) => v.status === 'sold').length;

    const brandCounts = new Map<string, number>();
    for (const v of VEHICLES) {
      brandCounts.set(v.brand, (brandCounts.get(v.brand) ?? 0) + 1);
    }

    return {
      totalVehicles: VEHICLES.length,
      vehiclesInStock: inStock,
      vehiclesReserved: reserved,
      vehiclesSold: sold,
      totalOrders: orders.length,
      pendingOrders: orders.filter((o) => o.status === 'pending').length,
      completedOrders: orders.filter((o) => o.status === 'completed').length,
      revenue: orders
        .filter((o) => o.status === 'completed')
        .reduce((sum, o) => sum + o.totalPrice, 0),
      averageOrderValue:
        orders.length > 0
          ? orders.reduce((sum, o) => sum + o.totalPrice, 0) / orders.length
          : 0,
      topBrands: Array.from(brandCounts.entries())
        .map(([brand, count]) => ({ brand, count }))
        .sort((a, b) => b.count - a.count),
      recentOrders: orders
        .slice(-5)
        .reverse()
        .map((o) => {
          const vehicle = VEHICLES.find((v) => v.id === o.vehicleId);
          return {
            id: o.id,
            customerName: o.customerName,
            vehicleBrand: vehicle?.brand ?? 'N/A',
            vehicleModel: vehicle?.model ?? 'N/A',
            totalPrice: o.totalPrice,
            status: o.status,
            createdAt: o.createdAt,
          };
        }),
      updatedAt: new Date().toISOString(),
    };
  },
};

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

export const mockDataSource: DataSource = {
  vehicles: vehicleSource,
  orders: orderSource,
  dashboard: dashboardSource,
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
