import { describe, it, expect, vi } from 'vitest';
import { EventBus } from './event-bus.js';

describe('EventBus', () => {
  describe('events', () => {
    it('delivers event to subscriber', () => {
      const bus = new EventBus();
      const handler = vi.fn();

      bus.subscribe('OrderCreated', handler);
      bus.publish({
        version: 1,
        type: 'OrderCreated',
        orderId: 'o-001',
        vehicleId: 'v-001',
        customerName: 'Test',
        totalPrice: 1_000_000,
        createdAt: '2026-01-01T00:00:00Z',
      });

      expect(handler).toHaveBeenCalledOnce();
      expect(handler.mock.calls[0][0].orderId).toBe('o-001');
    });

    it('does not deliver event to wrong subscriber', () => {
      const bus = new EventBus();
      const handler = vi.fn();

      bus.subscribe('VehicleSelected', handler);
      bus.publish({
        version: 1,
        type: 'OrderCreated',
        orderId: 'o-001',
        vehicleId: 'v-001',
        customerName: 'Test',
        totalPrice: 1_000_000,
        createdAt: '2026-01-01T00:00:00Z',
      });

      expect(handler).not.toHaveBeenCalled();
    });

    it('supports multiple subscribers for same event', () => {
      const bus = new EventBus();
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      bus.subscribe('OrderCreated', handler1);
      bus.subscribe('OrderCreated', handler2);
      bus.publish({
        version: 1,
        type: 'OrderCreated',
        orderId: 'o-001',
        vehicleId: 'v-001',
        customerName: 'Test',
        totalPrice: 1_000_000,
        createdAt: '2026-01-01T00:00:00Z',
      });

      expect(handler1).toHaveBeenCalledOnce();
      expect(handler2).toHaveBeenCalledOnce();
    });

    it('unsubscribe stops delivery', () => {
      const bus = new EventBus();
      const handler = vi.fn();

      const unsub = bus.subscribe('OrderCreated', handler);
      unsub();

      bus.publish({
        version: 1,
        type: 'OrderCreated',
        orderId: 'o-001',
        vehicleId: 'v-001',
        customerName: 'Test',
        totalPrice: 1_000_000,
        createdAt: '2026-01-01T00:00:00Z',
      });

      expect(handler).not.toHaveBeenCalled();
    });

    it('handles handler errors without breaking other subscribers', () => {
      const bus = new EventBus();
      const errorHandler = vi.fn(() => { throw new Error('boom'); });
      const goodHandler = vi.fn();

      bus.subscribe('OrderCreated', errorHandler);
      bus.subscribe('OrderCreated', goodHandler);

      bus.publish({
        version: 1,
        type: 'OrderCreated',
        orderId: 'o-001',
        vehicleId: 'v-001',
        customerName: 'Test',
        totalPrice: 1_000_000,
        createdAt: '2026-01-01T00:00:00Z',
      });

      expect(goodHandler).toHaveBeenCalledOnce();
    });

    it('supports versioned events — v1 and v2 coexist', () => {
      const bus = new EventBus();
      const handler = vi.fn();

      bus.subscribe('VehicleSelected', handler);

      bus.publish({ version: 1, type: 'VehicleSelected', vehicleId: 'v-001', brand: 'BMW', model: '320d' });
      bus.publish({ version: 2, type: 'VehicleSelected', vehicleId: 'v-002', brand: 'Audi', model: 'A4', price: 4_500_000, year: 2024 });

      expect(handler).toHaveBeenCalledTimes(2);
      expect(handler.mock.calls[0][0].version).toBe(1);
      expect(handler.mock.calls[1][0].version).toBe(2);
    });
  });

  describe('commands', () => {
    it('executes registered command handler', () => {
      const bus = new EventBus();
      const handler = vi.fn();

      bus.registerCommand('NavigateTo', handler);
      bus.execute({ version: 1, type: 'NavigateTo', path: '/dashboard' });

      expect(handler).toHaveBeenCalledOnce();
      expect(handler.mock.calls[0][0].path).toBe('/dashboard');
    });

    it('warns when no handler registered', () => {
      const bus = new EventBus();
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      bus.execute({ version: 1, type: 'NavigateTo', path: '/test' });

      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it('unregister removes command handler', () => {
      const bus = new EventBus();
      const handler = vi.fn();

      const unreg = bus.registerCommand('NavigateTo', handler);
      unreg();

      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      bus.execute({ version: 1, type: 'NavigateTo', path: '/test' });

      expect(handler).not.toHaveBeenCalled();
      warnSpy.mockRestore();
    });
  });

  describe('clear', () => {
    it('removes all handlers', () => {
      const bus = new EventBus();
      const eventHandler = vi.fn();
      const cmdHandler = vi.fn();

      bus.subscribe('OrderCreated', eventHandler);
      bus.registerCommand('NavigateTo', cmdHandler);
      bus.clear();

      bus.publish({
        version: 1,
        type: 'OrderCreated',
        orderId: 'o-001',
        vehicleId: 'v-001',
        customerName: 'Test',
        totalPrice: 1_000_000,
        createdAt: '2026-01-01T00:00:00Z',
      });

      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      bus.execute({ version: 1, type: 'NavigateTo', path: '/test' });

      expect(eventHandler).not.toHaveBeenCalled();
      expect(cmdHandler).not.toHaveBeenCalled();
      warnSpy.mockRestore();
    });
  });
});
