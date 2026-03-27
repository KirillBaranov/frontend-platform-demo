import { describe, it, expect } from 'vitest';
import { isMinVersion, type VehicleSelectedV1, type VehicleSelectedV2, type OrderCreatedV1 } from './events.js';

describe('Events', () => {
  describe('isMinVersion', () => {
    it('returns true when event version matches minimum', () => {
      const event: VehicleSelectedV1 = {
        version: 1,
        type: 'VehicleSelected',
        vehicleId: 'v-001',
        brand: 'BMW',
        model: '320d',
      };
      expect(isMinVersion(event, 1)).toBe(true);
    });

    it('returns true when event version exceeds minimum', () => {
      const event: VehicleSelectedV2 = {
        version: 2,
        type: 'VehicleSelected',
        vehicleId: 'v-001',
        brand: 'BMW',
        model: '320d',
        price: 4_200_000,
        year: 2024,
      };
      expect(isMinVersion(event, 1)).toBe(true);
    });

    it('returns false when event version is below minimum', () => {
      const event: VehicleSelectedV1 = {
        version: 1,
        type: 'VehicleSelected',
        vehicleId: 'v-001',
        brand: 'BMW',
        model: '320d',
      };
      expect(isMinVersion(event, 2)).toBe(false);
    });
  });

  describe('type discriminators', () => {
    it('VehicleSelectedV2 has price and year fields', () => {
      const event: VehicleSelectedV2 = {
        version: 2,
        type: 'VehicleSelected',
        vehicleId: 'v-001',
        brand: 'BMW',
        model: '320d',
        price: 4_200_000,
        year: 2024,
      };
      expect(event.price).toBe(4_200_000);
      expect(event.year).toBe(2024);
    });

    it('OrderCreatedV1 has all required fields', () => {
      const event: OrderCreatedV1 = {
        version: 1,
        type: 'OrderCreated',
        orderId: 'o-001',
        vehicleId: 'v-001',
        customerName: 'Test',
        totalPrice: 3_500_000,
        createdAt: '2026-03-27T10:00:00Z',
      };
      expect(event.type).toBe('OrderCreated');
      expect(event.orderId).toBe('o-001');
    });
  });
});
