/**
 * Typed events for cross-module communication.
 *
 * Events are versioned — when a contract evolves, old modules keep working
 * until they migrate to the new version. The event bus can route both v1 and v2
 * simultaneously, so modules upgrade independently.
 */

// ---------------------------------------------------------------------------
// Base
// ---------------------------------------------------------------------------

/** Every event carries a version so consumers can handle multiple generations. */
export interface VersionedEvent {
  readonly version: number;
}

// ---------------------------------------------------------------------------
// Vehicle events
// ---------------------------------------------------------------------------

export interface VehicleSelectedV1 extends VersionedEvent {
  readonly version: 1;
  readonly type: 'VehicleSelected';
  readonly vehicleId: string;
  readonly brand: string;
  readonly model: string;
}

/** v2 adds price and year — existing v1 consumers keep working. */
export interface VehicleSelectedV2 extends VersionedEvent {
  readonly version: 2;
  readonly type: 'VehicleSelected';
  readonly vehicleId: string;
  readonly brand: string;
  readonly model: string;
  readonly price: number;
  readonly year: number;
}

export type VehicleSelected = VehicleSelectedV1 | VehicleSelectedV2;

// ---------------------------------------------------------------------------
// Order events
// ---------------------------------------------------------------------------

export interface OrderCreatedV1 extends VersionedEvent {
  readonly version: 1;
  readonly type: 'OrderCreated';
  readonly orderId: string;
  readonly vehicleId: string;
  readonly customerName: string;
  readonly totalPrice: number;
  readonly createdAt: string; // ISO 8601
}

export type OrderCreated = OrderCreatedV1;

// ---------------------------------------------------------------------------
// Dashboard events
// ---------------------------------------------------------------------------

export interface DashboardRefreshRequestedV1 extends VersionedEvent {
  readonly version: 1;
  readonly type: 'DashboardRefreshRequested';
}

export type DashboardRefreshRequested = DashboardRefreshRequestedV1;

// ---------------------------------------------------------------------------
// Notification events
// ---------------------------------------------------------------------------

export interface NotificationV1 extends VersionedEvent {
  readonly version: 1;
  readonly type: 'Notification';
  readonly level: 'info' | 'success' | 'warning' | 'error';
  readonly message: string;
  readonly durationMs?: number;
}

export type Notification = NotificationV1;

// ---------------------------------------------------------------------------
// Union of all platform events
// ---------------------------------------------------------------------------

export type PlatformEvent =
  | VehicleSelected
  | OrderCreated
  | DashboardRefreshRequested
  | Notification;

/** String literal union of all event type names. */
export type PlatformEventType = PlatformEvent['type'];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Type-safe event filter — extract the right union member by event type.
 *
 * @example
 * const handler = (e: EventOf<'OrderCreated'>) => { ... };
 */
export type EventOf<T extends PlatformEventType> = Extract<PlatformEvent, { type: T }>;

/**
 * Check if an event matches a minimum version.
 * Useful for consumers that need fields added in later versions.
 */
export function isMinVersion<E extends VersionedEvent>(
  event: E,
  minVersion: number,
): boolean {
  return event.version >= minVersion;
}
