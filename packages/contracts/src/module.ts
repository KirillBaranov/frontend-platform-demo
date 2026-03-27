/**
 * Module contract — every micro-frontend implements this interface.
 *
 * The shell loads modules dynamically and calls mount/unmount.
 * Modules never import from each other — only from contracts.
 *
 * This interface is framework-agnostic: React, Vue, Svelte, vanilla —
 * anything that can render into an HTMLElement works.
 */

import type { FeatureFlags } from './feature-flags.js';

// ---------------------------------------------------------------------------
// Auth context passed from shell to modules
// ---------------------------------------------------------------------------

export interface AuthContext {
  readonly token: string;
  readonly user: {
    readonly id: string;
    readonly name: string;
    readonly role: 'manager' | 'admin' | 'dealer';
  };
}

// ---------------------------------------------------------------------------
// Mount context — everything a module receives from shell
// ---------------------------------------------------------------------------

export interface ModuleContext {
  /** Typed event bus for cross-module communication. */
  readonly eventBus: ModuleEventBus;

  /** Current feature flags snapshot. */
  readonly featureFlags: FeatureFlags;

  /** Auth state managed by shell. Modules never authenticate themselves. */
  readonly auth: AuthContext;

  /** Internationalization helper. */
  readonly t: (key: string) => string;

  /** Base path for this module (e.g., "/catalog"). */
  readonly basePath: string;
}

// ---------------------------------------------------------------------------
// Event bus interface (subset exposed to modules)
// ---------------------------------------------------------------------------

export interface ModuleEventBus {
  publish(event: import('./events.js').PlatformEvent): void;
  subscribe<T extends import('./events.js').PlatformEventType>(
    type: T,
    handler: (event: import('./events.js').EventOf<T>) => void,
  ): () => void; // returns unsubscribe function

  execute(command: import('./commands.js').PlatformCommand): void;
}

// ---------------------------------------------------------------------------
// Module definition — what every module exports
// ---------------------------------------------------------------------------

export interface ModuleDefinition {
  /** Unique module identifier. */
  readonly id: string;

  /** Human-readable name for UI (sidebar, breadcrumbs). */
  readonly name: string;

  /** Route path prefix (e.g., "/catalog", "/dashboard"). */
  readonly route: string;

  /** Icon identifier for sidebar navigation. */
  readonly icon?: string;

  /**
   * Mount the module into the given container.
   * Called by shell when user navigates to this module's route.
   */
  mount(container: HTMLElement, context: ModuleContext): void | Promise<void>;

  /**
   * Unmount and clean up.
   * Called by shell when user navigates away.
   * Must remove all event listeners, timers, and DOM nodes.
   */
  unmount(): void | Promise<void>;

  /**
   * Optional: called when feature flags change while module is mounted.
   * If not implemented, shell will unmount + remount with new flags.
   */
  onFeatureFlagsChanged?(flags: FeatureFlags): void;

  /**
   * Optional: called for sub-route navigation within this module.
   * If not implemented, module handles its own internal routing.
   */
  onNavigate?(path: string, params?: Record<string, string>): void;
}
