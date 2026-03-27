/**
 * Gateway BFF — aggregates data from multiple sources.
 *
 * Modules never call backend services directly. They call the Gateway,
 * which fetches from Delphi adapter (legacy), catalog service (new), etc.
 *
 * Why BFF:
 * - Security: modules don't know internal service topology
 * - Aggregation: dashboard needs data from 3 sources → one call
 * - Migration: swap Delphi adapter for new service → modules unchanged
 * - Consistency: one auth layer, one error format
 */

import express from 'express';
import cors from 'cors';
import {
  fetchVehiclesFromDelphi,
  fetchOrdersFromDelphi,
  normalizeVehicle,
  normalizeOrder,
} from './delphi-adapter.js';

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

// ---------------------------------------------------------------------------
// Vehicles — sourced from Delphi legacy system
// ---------------------------------------------------------------------------

app.get('/api/vehicles', async (_req, res) => {
  const raw = await fetchVehiclesFromDelphi();
  const vehicles = raw.map(normalizeVehicle);

  // Apply query filters
  let result = vehicles;
  const { brand, yearFrom, yearTo, priceFrom, priceTo, status, dealerId } = _req.query;
  if (brand) result = result.filter((v) => v.brand === brand);
  if (yearFrom) result = result.filter((v) => v.year >= Number(yearFrom));
  if (yearTo) result = result.filter((v) => v.year <= Number(yearTo));
  if (priceFrom) result = result.filter((v) => v.price >= Number(priceFrom));
  if (priceTo) result = result.filter((v) => v.price <= Number(priceTo));
  if (status) result = result.filter((v) => v.status === status);
  if (dealerId) result = result.filter((v) => v.dealerId === dealerId);

  res.json(result);
});

app.get('/api/vehicles/:id', async (req, res) => {
  const raw = await fetchVehiclesFromDelphi();
  const vehicles = raw.map(normalizeVehicle);
  const vehicle = vehicles.find((v) => v.id === req.params.id);
  if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
  res.json(vehicle);
});

// ---------------------------------------------------------------------------
// Orders — sourced from Delphi legacy system
// ---------------------------------------------------------------------------

app.get('/api/orders', async (_req, res) => {
  const raw = await fetchOrdersFromDelphi();
  res.json(raw.map(normalizeOrder));
});

app.get('/api/orders/:id', async (req, res) => {
  const raw = await fetchOrdersFromDelphi();
  const orders = raw.map(normalizeOrder);
  const order = orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

app.post('/api/orders', async (req, res) => {
  const { vehicleId, customerName, customerPhone, totalPrice } = req.body;
  const order = {
    id: `o-${Date.now()}`,
    vehicleId,
    customerName,
    customerPhone,
    totalPrice,
    status: 'pending',
    dealerId: 'dealer-1',
    managerId: 'user-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  res.status(201).json(order);
});

// ---------------------------------------------------------------------------
// Dashboard — aggregated from multiple adapters
// ---------------------------------------------------------------------------

app.get('/api/dashboard', async (_req, res) => {
  // Aggregate from Delphi + potentially other sources
  const [rawVehicles, rawOrders] = await Promise.all([
    fetchVehiclesFromDelphi(),
    fetchOrdersFromDelphi(),
  ]);

  const vehicles = rawVehicles.map(normalizeVehicle);
  const orders = rawOrders.map(normalizeOrder);

  const inStock = vehicles.filter((v) => v.status === 'in_stock').length;
  const reserved = vehicles.filter((v) => v.status === 'reserved').length;
  const sold = vehicles.filter((v) => v.status === 'sold').length;

  const brandCounts = new Map<string, number>();
  for (const v of vehicles) {
    brandCounts.set(v.brand, (brandCounts.get(v.brand) ?? 0) + 1);
  }

  const completedOrders = orders.filter((o) => o.status === 'completed');

  res.json({
    totalVehicles: vehicles.length,
    vehiclesInStock: inStock,
    vehiclesReserved: reserved,
    vehiclesSold: sold,
    totalOrders: orders.length,
    pendingOrders: orders.filter((o) => o.status === 'pending').length,
    completedOrders: completedOrders.length,
    revenue: completedOrders.reduce((sum, o) => sum + o.totalPrice, 0),
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
        const vehicle = vehicles.find((v) => v.id === o.vehicleId);
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
  });
});

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'gateway', adapters: ['delphi'] });
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

app.listen(PORT, () => {
  console.log(`[Gateway] BFF running on http://localhost:${PORT}`);
  console.log(`[Gateway] Adapters: delphi (mock)`);
  console.log(`[Gateway] Routes: /api/vehicles, /api/orders, /api/dashboard`);
});
