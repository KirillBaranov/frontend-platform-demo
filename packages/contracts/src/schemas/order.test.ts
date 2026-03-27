import { describe, it, expect } from 'vitest';
import { OrderSchema } from './order.js';

describe('OrderSchema', () => {
  const validOrder = {
    id: 'o-001',
    vehicleId: 'v-001',
    customerName: 'Алексей Смирнов',
    totalPrice: 3_500_000,
    status: 'pending',
    dealerId: 'dealer-1',
    createdAt: '2026-03-20T14:00:00Z',
    updatedAt: '2026-03-20T14:00:00Z',
  };

  it('validates a correct order', () => {
    const result = OrderSchema.safeParse(validOrder);
    expect(result.success).toBe(true);
  });

  it('accepts optional fields', () => {
    const withOptional = {
      ...validOrder,
      customerPhone: '+7 (999) 123-45-67',
      managerId: 'user-1',
      tradeInVehicleId: 'v-005',
    };
    const result = OrderSchema.safeParse(withOptional);
    expect(result.success).toBe(true);
  });

  it('rejects order with invalid status', () => {
    const result = OrderSchema.safeParse({ ...validOrder, status: 'invalid' });
    expect(result.success).toBe(false);
  });

  it('rejects order with negative price', () => {
    const result = OrderSchema.safeParse({ ...validOrder, totalPrice: -1 });
    expect(result.success).toBe(false);
  });

  it('rejects order without required fields', () => {
    const { customerName, ...incomplete } = validOrder;
    const result = OrderSchema.safeParse(incomplete);
    expect(result.success).toBe(false);
  });
});
