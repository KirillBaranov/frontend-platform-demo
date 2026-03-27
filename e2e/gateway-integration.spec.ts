import { test, expect } from '@playwright/test';

test.describe('Gateway integration', () => {
  test('health endpoint responds', async ({ request }) => {
    const response = await request.get('http://localhost:4000/api/health');
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.status).toBe('ok');
    expect(body.service).toBe('gateway');
    expect(body.adapters).toContain('delphi');
  });

  test('returns vehicles from Delphi adapter in normalized format', async ({ request }) => {
    const response = await request.get('http://localhost:4000/api/vehicles');
    expect(response.ok()).toBeTruthy();

    const vehicles = await response.json();
    expect(vehicles.length).toBe(8);

    // Verify normalized camelCase (not Delphi UPPER_CASE)
    const first = vehicles[0];
    expect(first).toHaveProperty('id');
    expect(first).toHaveProperty('vin');
    expect(first).toHaveProperty('brand');
    expect(first).toHaveProperty('price');
    expect(first).toHaveProperty('status');
    expect(first).not.toHaveProperty('ID');
    expect(first).not.toHaveProperty('BRAND');
  });

  test('filters vehicles by brand', async ({ request }) => {
    const response = await request.get('http://localhost:4000/api/vehicles?brand=BMW');
    const vehicles = await response.json();

    expect(vehicles.length).toBeGreaterThan(0);
    for (const v of vehicles) {
      expect(v.brand).toBe('BMW');
    }
  });

  test('filters vehicles by status', async ({ request }) => {
    const response = await request.get('http://localhost:4000/api/vehicles?status=in_stock');
    const vehicles = await response.json();

    for (const v of vehicles) {
      expect(v.status).toBe('in_stock');
    }
  });

  test('returns single vehicle by id', async ({ request }) => {
    const response = await request.get('http://localhost:4000/api/vehicles/v-001');
    expect(response.ok()).toBeTruthy();

    const vehicle = await response.json();
    expect(vehicle.id).toBe('v-001');
    expect(vehicle.brand).toBe('BMW');
  });

  test('returns 404 for unknown vehicle', async ({ request }) => {
    const response = await request.get('http://localhost:4000/api/vehicles/unknown');
    expect(response.status()).toBe(404);
  });

  test('returns orders from Delphi adapter', async ({ request }) => {
    const response = await request.get('http://localhost:4000/api/orders');
    expect(response.ok()).toBeTruthy();

    const orders = await response.json();
    expect(orders.length).toBeGreaterThan(0);
    expect(orders[0]).toHaveProperty('id');
    expect(orders[0]).toHaveProperty('customerName');
    expect(orders[0]).toHaveProperty('status');
  });

  test('creates order via POST', async ({ request }) => {
    const response = await request.post('http://localhost:4000/api/orders', {
      data: {
        vehicleId: 'v-001',
        customerName: 'E2E Test Client',
        totalPrice: 4_200_000,
      },
    });

    expect(response.status()).toBe(201);

    const order = await response.json();
    expect(order.id).toBeTruthy();
    expect(order.customerName).toBe('E2E Test Client');
    expect(order.status).toBe('pending');
  });

  test('returns aggregated dashboard stats', async ({ request }) => {
    const response = await request.get('http://localhost:4000/api/dashboard');
    expect(response.ok()).toBeTruthy();

    const stats = await response.json();
    expect(stats.totalVehicles).toBe(8);
    expect(stats.totalOrders).toBeGreaterThan(0);
    expect(stats.topBrands.length).toBeGreaterThan(0);
    expect(stats.recentOrders.length).toBeGreaterThan(0);
    expect(stats.vehiclesInStock + stats.vehiclesReserved + stats.vehiclesSold).toBe(stats.totalVehicles);
  });
});
