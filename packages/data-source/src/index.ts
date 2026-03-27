/**
 * Data source entry point — selects active implementation by environment.
 *
 * DATA_SOURCE env variable controls which adapter is used:
 *   - "mock"  → mock data (default, works offline, GitHub Pages, CI)
 *   - "http"  → fetch from Gateway BFF (local dev with `pnpm start`)
 *
 * Modules import from here and never know where data comes from:
 *
 *   import { dataSource } from '@platform/data-source';
 *   const vehicles = await dataSource.vehicles.getAll();
 */

import type { DataSource } from './types.js';
import { mockDataSource } from './mock.js';

export type { DataSource, IVehicleSource, IOrderSource, IDashboardSource } from './types.js';
export type { VehicleFilters, CreateOrderInput } from './types.js';

/**
 * Resolve the active data source based on environment.
 *
 * HTTP adapter is loaded dynamically to avoid bundling fetch logic
 * when running in mock mode (GitHub Pages).
 */
async function resolveDataSource(): Promise<DataSource> {
  const meta = import.meta as unknown as { env?: Record<string, string> };
  const mode = meta.env?.VITE_DATA_SOURCE ?? 'mock';

  if (mode === 'http') {
    const { httpDataSource } = await import('./http.js');
    return httpDataSource;
  }

  return mockDataSource;
}

/** Singleton — resolved once, cached. */
let cached: DataSource | null = null;

export async function getDataSource(): Promise<DataSource> {
  if (!cached) {
    cached = await resolveDataSource();
  }
  return cached;
}

/** Synchronous access to mock data (for tests and initial render). */
export { mockDataSource } from './mock.js';
