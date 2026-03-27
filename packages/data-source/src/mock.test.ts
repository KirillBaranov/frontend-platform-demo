import { describe, it, expect } from 'vitest';
import { mockDataSource } from './mock.js';

describe('Mock Data Source', () => {
  describe('vehicles', () => {
    it('returns all vehicles', async () => {
      const vehicles = await mockDataSource.vehicles.getAll();
      expect(vehicles.length).toBeGreaterThan(0);
    });

    it('filters by brand', async () => {
      const vehicles = await mockDataSource.vehicles.getAll({ brand: 'BMW' });
      expect(vehicles.length).toBeGreaterThan(0);
      for (const v of vehicles) {
        expect(v.brand).toBe('BMW');
      }
    });

    it('filters by status', async () => {
      const vehicles = await mockDataSource.vehicles.getAll({ status: 'in_stock' });
      for (const v of vehicles) {
        expect(v.status).toBe('in_stock');
      }
    });

    it('filters by price range', async () => {
      const vehicles = await mockDataSource.vehicles.getAll({ priceFrom: 4_000_000, priceTo: 5_000_000 });
      for (const v of vehicles) {
        expect(v.price).toBeGreaterThanOrEqual(4_000_000);
        expect(v.price).toBeLessThanOrEqual(5_000_000);
      }
    });

    it('returns vehicle by id', async () => {
      const vehicle = await mockDataSource.vehicles.getById('v-001');
      expect(vehicle).not.toBeNull();
      expect(vehicle!.id).toBe('v-001');
      expect(vehicle!.brand).toBe('BMW');
    });

    it('returns null for unknown id', async () => {
      const vehicle = await mockDataSource.vehicles.getById('unknown');
      expect(vehicle).toBeNull();
    });
  });

  describe('orders', () => {
    it('returns all orders', async () => {
      const orders = await mockDataSource.orders.getAll();
      expect(orders.length).toBeGreaterThan(0);
    });

    it('creates a new order', async () => {
      const order = await mockDataSource.orders.create({
        vehicleId: 'v-001',
        customerName: 'Test Client',
        totalPrice: 4_200_000,
      });
      expect(order.id).toBeTruthy();
      expect(order.customerName).toBe('Test Client');
      expect(order.status).toBe('pending');
    });

    it('returns order by id', async () => {
      const order = await mockDataSource.orders.getById('o-001');
      expect(order).not.toBeNull();
      expect(order!.id).toBe('o-001');
    });
  });

  describe('dashboard', () => {
    it('returns aggregated stats', async () => {
      const stats = await mockDataSource.dashboard.getStats();
      expect(stats.totalVehicles).toBeGreaterThan(0);
      expect(stats.totalOrders).toBeGreaterThan(0);
      expect(stats.topBrands.length).toBeGreaterThan(0);
      expect(stats.recentOrders.length).toBeGreaterThan(0);
      expect(stats.updatedAt).toBeTruthy();
    });

    it('stats vehicle counts add up', async () => {
      const stats = await mockDataSource.dashboard.getStats();
      expect(stats.vehiclesInStock + stats.vehiclesReserved + stats.vehiclesSold)
        .toBe(stats.totalVehicles);
    });
  });
});
