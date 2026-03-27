/**
 * Delphi adapter — simulates legacy system responses.
 *
 * In production, this would be:
 * - HTTP calls to a Delphi REST wrapper
 * - IPC (inter-process communication) to a running Delphi process
 * - Database queries to a shared Delphi database
 *
 * The adapter isolates the legacy protocol — when Delphi is replaced,
 * only this file changes. Gateway routes and frontend stay untouched.
 */

export interface DelphiVehicle {
  ID: string;
  VIN: string;
  BRAND: string;
  MODEL: string;
  YEAR: number;
  PRICE: number;
  MILEAGE: number;
  COLOR: string;
  STATUS: 'IN_STOCK' | 'RESERVED' | 'SOLD';
  DEALER_ID: string;
  IMAGE_URL?: string;
  CREATED_AT: string;
}

export interface DelphiOrder {
  ID: string;
  VEHICLE_ID: string;
  CUSTOMER_NAME: string;
  CUSTOMER_PHONE?: string;
  TOTAL_PRICE: number;
  STATUS: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  DEALER_ID: string;
  MANAGER_ID?: string;
  TRADE_IN_VEHICLE_ID?: string;
  CREATED_AT: string;
  UPDATED_AT: string;
}

// Simulated Delphi data (UPPER_CASE fields — typical legacy format)
const DELPHI_VEHICLES: DelphiVehicle[] = [
  {
    ID: 'v-001', VIN: 'WBA11AA0X0CK12345', BRAND: 'BMW', MODEL: '320d',
    YEAR: 2024, PRICE: 4200000, MILEAGE: 0, COLOR: 'Серебристый',
    STATUS: 'IN_STOCK', DEALER_ID: 'dealer-1', CREATED_AT: '2026-01-15T10:00:00Z',
  },
  {
    ID: 'v-002', VIN: 'WVWZZZ3CZWE123456', BRAND: 'Volkswagen', MODEL: 'Tiguan',
    YEAR: 2025, PRICE: 3800000, MILEAGE: 0, COLOR: 'Белый',
    STATUS: 'IN_STOCK', DEALER_ID: 'dealer-1', CREATED_AT: '2026-02-01T09:00:00Z',
  },
  {
    ID: 'v-003', VIN: 'JTDKN3DU5A0123456', BRAND: 'Toyota', MODEL: 'Camry',
    YEAR: 2024, PRICE: 3500000, MILEAGE: 12000, COLOR: 'Чёрный',
    STATUS: 'RESERVED', DEALER_ID: 'dealer-1', CREATED_AT: '2025-11-20T14:30:00Z',
  },
  {
    ID: 'v-004', VIN: 'XWEPH81ABP0012345', BRAND: 'Hyundai', MODEL: 'Tucson',
    YEAR: 2025, PRICE: 3200000, MILEAGE: 0, COLOR: 'Синий',
    STATUS: 'IN_STOCK', DEALER_ID: 'dealer-2', CREATED_AT: '2026-03-01T08:00:00Z',
  },
  {
    ID: 'v-005', VIN: 'WMEEJ9AA1E0123456', BRAND: 'Mercedes-Benz', MODEL: 'E-Class',
    YEAR: 2023, PRICE: 5900000, MILEAGE: 25000, COLOR: 'Серый',
    STATUS: 'SOLD', DEALER_ID: 'dealer-1', CREATED_AT: '2025-06-10T11:00:00Z',
  },
  {
    ID: 'v-006', VIN: 'KNAGH41E59A123456', BRAND: 'Kia', MODEL: 'Sportage',
    YEAR: 2025, PRICE: 2900000, MILEAGE: 0, COLOR: 'Красный',
    STATUS: 'IN_STOCK', DEALER_ID: 'dealer-2', CREATED_AT: '2026-03-10T10:00:00Z',
  },
  {
    ID: 'v-007', VIN: 'WAUZZZ4G9FN123456', BRAND: 'Audi', MODEL: 'A4',
    YEAR: 2024, PRICE: 4500000, MILEAGE: 8000, COLOR: 'Белый',
    STATUS: 'IN_STOCK', DEALER_ID: 'dealer-1', CREATED_AT: '2025-12-05T15:00:00Z',
  },
  {
    ID: 'v-008', VIN: 'SJNFAAE11U2123456', BRAND: 'Nissan', MODEL: 'X-Trail',
    YEAR: 2025, PRICE: 3100000, MILEAGE: 0, COLOR: 'Зелёный',
    STATUS: 'RESERVED', DEALER_ID: 'dealer-2', CREATED_AT: '2026-02-20T12:00:00Z',
  },
];

const DELPHI_ORDERS: DelphiOrder[] = [
  {
    ID: 'o-001', VEHICLE_ID: 'v-003', CUSTOMER_NAME: 'Алексей Смирнов',
    CUSTOMER_PHONE: '+7 (999) 123-45-67', TOTAL_PRICE: 3500000,
    STATUS: 'CONFIRMED', DEALER_ID: 'dealer-1', MANAGER_ID: 'user-1',
    CREATED_AT: '2026-03-20T14:00:00Z', UPDATED_AT: '2026-03-21T10:00:00Z',
  },
  {
    ID: 'o-002', VEHICLE_ID: 'v-005', CUSTOMER_NAME: 'Мария Козлова',
    TOTAL_PRICE: 5900000, STATUS: 'COMPLETED', DEALER_ID: 'dealer-1',
    MANAGER_ID: 'user-1',
    CREATED_AT: '2026-02-15T11:00:00Z', UPDATED_AT: '2026-03-01T09:00:00Z',
  },
  {
    ID: 'o-003', VEHICLE_ID: 'v-008', CUSTOMER_NAME: 'Дмитрий Волков',
    CUSTOMER_PHONE: '+7 (916) 987-65-43', TOTAL_PRICE: 3100000,
    STATUS: 'PENDING', DEALER_ID: 'dealer-2',
    CREATED_AT: '2026-03-25T16:00:00Z', UPDATED_AT: '2026-03-25T16:00:00Z',
  },
];

/**
 * Simulate Delphi API call with latency.
 * In production: HTTP/IPC to real Delphi process.
 */
async function delphiCall<T>(data: T, latencyMs = 150): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), latencyMs));
}

/** Fetch vehicles from "Delphi" and normalize to platform format. */
export async function fetchVehiclesFromDelphi(): Promise<DelphiVehicle[]> {
  console.log('[Delphi Adapter] Fetching vehicles from legacy system...');
  return delphiCall(DELPHI_VEHICLES);
}

/** Fetch orders from "Delphi" and normalize to platform format. */
export async function fetchOrdersFromDelphi(): Promise<DelphiOrder[]> {
  console.log('[Delphi Adapter] Fetching orders from legacy system...');
  return delphiCall(DELPHI_ORDERS);
}

/** Reserve a vehicle in "Delphi" — marks it as RESERVED. */
export function reserveVehicleInDelphi(vehicleId: string): void {
  const idx = DELPHI_VEHICLES.findIndex((v) => v.ID === vehicleId);
  if (idx !== -1) {
    DELPHI_VEHICLES[idx] = { ...DELPHI_VEHICLES[idx], STATUS: 'RESERVED' };
    console.log(`[Delphi Adapter] Vehicle ${vehicleId} → RESERVED`);
  }
}

/** Normalize Delphi UPPER_CASE format to platform camelCase. */
export function normalizeVehicle(d: DelphiVehicle) {
  return {
    id: d.ID,
    vin: d.VIN,
    brand: d.BRAND,
    model: d.MODEL,
    year: d.YEAR,
    price: d.PRICE,
    mileage: d.MILEAGE,
    color: d.COLOR,
    status: d.STATUS.toLowerCase().replace('_', '_') as 'in_stock' | 'reserved' | 'sold',
    dealerId: d.DEALER_ID,
    imageUrl: d.IMAGE_URL,
    createdAt: d.CREATED_AT,
  };
}

export function normalizeOrder(d: DelphiOrder) {
  return {
    id: d.ID,
    vehicleId: d.VEHICLE_ID,
    customerName: d.CUSTOMER_NAME,
    customerPhone: d.CUSTOMER_PHONE,
    totalPrice: d.TOTAL_PRICE,
    status: d.STATUS.toLowerCase() as 'pending' | 'confirmed' | 'completed' | 'cancelled',
    dealerId: d.DEALER_ID,
    managerId: d.MANAGER_ID,
    tradeInVehicleId: d.TRADE_IN_VEHICLE_ID,
    createdAt: d.CREATED_AT,
    updatedAt: d.UPDATED_AT,
  };
}
