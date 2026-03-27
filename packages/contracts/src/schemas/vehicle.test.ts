import { describe, it, expect } from 'vitest';
import { VehicleSchema, VehicleListSchema } from './vehicle.js';

describe('VehicleSchema', () => {
  const validVehicle = {
    id: 'v-001',
    vin: 'WBA11AA0X0CK12345',
    brand: 'BMW',
    model: '320d',
    year: 2024,
    price: 4_200_000,
    mileage: 0,
    color: 'Silver',
    status: 'in_stock',
    dealerId: 'dealer-1',
    createdAt: '2026-01-15T10:00:00Z',
  };

  it('validates a correct vehicle', () => {
    const result = VehicleSchema.safeParse(validVehicle);
    expect(result.success).toBe(true);
  });

  it('rejects vehicle with invalid VIN length', () => {
    const result = VehicleSchema.safeParse({ ...validVehicle, vin: 'SHORT' });
    expect(result.success).toBe(false);
  });

  it('rejects vehicle with negative price', () => {
    const result = VehicleSchema.safeParse({ ...validVehicle, price: -100 });
    expect(result.success).toBe(false);
  });

  it('rejects vehicle with invalid status', () => {
    const result = VehicleSchema.safeParse({ ...validVehicle, status: 'unknown' });
    expect(result.success).toBe(false);
  });

  it('rejects vehicle with year out of range', () => {
    const result = VehicleSchema.safeParse({ ...validVehicle, year: 1900 });
    expect(result.success).toBe(false);
  });

  it('accepts optional imageUrl', () => {
    const withImage = { ...validVehicle, imageUrl: 'https://example.com/img.jpg' };
    const result = VehicleSchema.safeParse(withImage);
    expect(result.success).toBe(true);
  });

  it('validates a list of vehicles', () => {
    const result = VehicleListSchema.safeParse([validVehicle, { ...validVehicle, id: 'v-002' }]);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(2);
    }
  });
});
