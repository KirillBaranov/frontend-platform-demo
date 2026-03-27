// Events — versioned, cross-module notifications
export {
  type VersionedEvent,
  type VehicleSelected,
  type VehicleSelectedV1,
  type VehicleSelectedV2,
  type OrderCreated,
  type OrderCreatedV1,
  type DashboardRefreshRequested,
  type Notification,
  type PlatformEvent,
  type PlatformEventType,
  type EventOf,
  isMinVersion,
} from './events.js';

// Commands — versioned, imperative cross-module actions
export {
  type NavigateTo,
  type ShowNotification,
  type SetFeatureFlag,
  type PlatformCommand,
  type PlatformCommandType,
  type CommandOf,
} from './commands.js';

// Module contract — what every micro-frontend implements
export {
  type AuthContext,
  type ModuleContext,
  type ModuleEventBus,
  type ModuleDefinition,
} from './module.js';

// Feature flags
export {
  type FeatureFlagName,
  type FeatureFlags,
  DEFAULT_FLAGS,
} from './feature-flags.js';

// Zod schemas — validated at data boundaries
export {
  VehicleSchema,
  VehicleListSchema,
  type Vehicle,
  OrderSchema,
  OrderListSchema,
  type Order,
  DashboardStatsSchema,
  type DashboardStats,
} from './schemas/index.js';
