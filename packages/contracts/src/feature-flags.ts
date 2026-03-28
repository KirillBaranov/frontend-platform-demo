/**
 * Feature flag types.
 *
 * Flags are managed by shell and passed to modules via ModuleContext.
 * Shell loads flags from a JSON config and supports hot-reload.
 */

/** Known flag names — extend as new scenarios are added. */
export type FeatureFlagName =
  | 'network_mode'      // show all dealers in the network vs single dealer
  | 'trade_in_enabled'  // trade-in module visible in catalog
  | 'devtools_enabled'  // platform devtools panel
  | 'dark_theme'        // UI theme toggle (future)
  | string;             // allow arbitrary flags for extensibility

/** Feature flags snapshot — simple key-value map. */
export type FeatureFlags = Record<FeatureFlagName, boolean>;

/** Default flags used when no config is loaded. */
export const DEFAULT_FLAGS: FeatureFlags = {
  network_mode: false,
  trade_in_enabled: false,
  devtools_enabled: true,
  dark_theme: false,
};
