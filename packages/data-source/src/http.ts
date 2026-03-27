/**
 * HTTP data source — fetches from Gateway BFF.
 *
 * Used when running locally with `pnpm start` (gateway on :4000).
 * Validates responses with Zod schemas at the boundary.
 */

import {
  VehicleListSchema,
  VehicleSchema,
  OrderListSchema,
  OrderSchema,
  DashboardStatsSchema,
  type Vehicle,
  type Order,
  type DashboardStats,
} from '@platform/contracts';

import type {
  DataSource,
  IVehicleSource,
  IOrderSource,
  IDashboardSource,
  VehicleFilters,
  CreateOrderInput,
} from './types.js';

const BASE_URL = '/api';

async function fetchJSON<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// HTTP implementations with Zod validation at the boundary
// ---------------------------------------------------------------------------

const vehicleSource: IVehicleSource = {
  async getAll(filters?: VehicleFilters): Promise<Vehicle[]> {
    const params = new URLSearchParams();
    if (filters?.brand) params.set('brand', filters.brand);
    if (filters?.yearFrom) params.set('yearFrom', String(filters.yearFrom));
    if (filters?.yearTo) params.set('yearTo', String(filters.yearTo));
    if (filters?.priceFrom) params.set('priceFrom', String(filters.priceFrom));
    if (filters?.priceTo) params.set('priceTo', String(filters.priceTo));
    if (filters?.status) params.set('status', filters.status);
    if (filters?.dealerId) params.set('dealerId', filters.dealerId);

    const query = params.toString();
    const data = await fetchJSON(`/vehicles${query ? `?${query}` : ''}`);
    return VehicleListSchema.parse(data);
  },

  async getById(id: string): Promise<Vehicle | null> {
    try {
      const data = await fetchJSON(`/vehicles/${id}`);
      return VehicleSchema.parse(data);
    } catch {
      return null;
    }
  },
};

const orderSource: IOrderSource = {
  async getAll(): Promise<Order[]> {
    const data = await fetchJSON('/orders');
    return OrderListSchema.parse(data);
  },

  async getById(id: string): Promise<Order | null> {
    try {
      const data = await fetchJSON(`/orders/${id}`);
      return OrderSchema.parse(data);
    } catch {
      return null;
    }
  },

  async create(input: CreateOrderInput): Promise<Order> {
    const data = await fetchJSON('/orders', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return OrderSchema.parse(data);
  },

  async updateStatus(id: string, status: string): Promise<Order> {
    const data = await fetchJSON(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return OrderSchema.parse(data);
  },
};

const dashboardSource: IDashboardSource = {
  async getStats(): Promise<DashboardStats> {
    const data = await fetchJSON('/dashboard');
    return DashboardStatsSchema.parse(data);
  },
};

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

export const httpDataSource: DataSource = {
  vehicles: vehicleSource,
  orders: orderSource,
  dashboard: dashboardSource,
};
