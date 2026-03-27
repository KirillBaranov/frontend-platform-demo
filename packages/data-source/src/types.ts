/**
 * Data source interfaces — the adapter contract.
 *
 * Modules depend on these interfaces, not on concrete implementations.
 * Swap mock → http → grpc → websocket without changing module code.
 */

import type { Vehicle, Order, DashboardStats } from '@platform/contracts';

export interface IVehicleSource {
  getAll(filters?: VehicleFilters): Promise<Vehicle[]>;
  getById(id: string): Promise<Vehicle | null>;
}

export interface VehicleFilters {
  brand?: string;
  yearFrom?: number;
  yearTo?: number;
  priceFrom?: number;
  priceTo?: number;
  status?: Vehicle['status'];
  dealerId?: string;
}

export interface IOrderSource {
  getAll(): Promise<Order[]>;
  getById(id: string): Promise<Order | null>;
  create(data: CreateOrderInput): Promise<Order>;
}

export interface CreateOrderInput {
  vehicleId: string;
  customerName: string;
  customerPhone?: string;
  totalPrice: number;
}

export interface IDashboardSource {
  getStats(): Promise<DashboardStats>;
}

/** Combined data source — one object for all domain operations. */
export interface DataSource {
  vehicles: IVehicleSource;
  orders: IOrderSource;
  dashboard: IDashboardSource;
}
