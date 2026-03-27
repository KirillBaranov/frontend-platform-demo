/**
 * Feature flag types.
 *
 * Flags are managed by shell and passed to modules via ModuleContext.
 * Shell loads flags from a JSON config and supports hot-reload.
 */

/** Known flag names — extend as new scenarios are added. */
export type FeatureFlagName =
  | 'dealer_mode'       // single dealer view vs network-wide
  | 'network_mode'      // show all dealers in the network
  | 'trade_in_enabled'  // trade-in module visible
  | 'dark_theme'        // UI theme toggle
  | 'devtools_enabled'  // platform devtools panel
  | string;             // allow arbitrary flags for extensibility

/** Feature flags snapshot — simple key-value map. */
export type FeatureFlags = Record<FeatureFlagName, boolean>;

/** Default flags used when no config is loaded. */
export const DEFAULT_FLAGS: FeatureFlags = {
  dealer_mode: true,
  network_mode: false,
  trade_in_enabled: false,
  dark_theme: false,
  devtools_enabled: true,
};
