/**
 * Feature flag manager.
 *
 * Loads flags from a JSON config. Supports hot-reload:
 * change the config → shell notifies mounted modules via onFeatureFlagsChanged().
 *
 * Flags control what modules are visible, what UI sections are shown,
 * and what scenarios are active (dealer_mode, network_mode, trade_in, etc.)
 */

import { type FeatureFlags, DEFAULT_FLAGS } from '@platform/contracts';

export type FlagChangeListener = (flags: FeatureFlags) => void;

export class FeatureFlagManager {
  private flags: FeatureFlags;
  private listeners = new Set<FlagChangeListener>();

  constructor(initial?: Partial<FeatureFlags>) {
    this.flags = Object.assign({}, DEFAULT_FLAGS, initial) as FeatureFlags;
  }

  /** Get current snapshot of all flags. */
  getAll(): FeatureFlags {
    return { ...this.flags };
  }

  /** Check if a specific flag is enabled. */
  isEnabled(flag: string): boolean {
    return this.flags[flag] ?? false;
  }

  /** Set a single flag. Notifies all listeners. */
  set(flag: string, enabled: boolean): void {
    if (this.flags[flag] === enabled) return;
    this.flags = { ...this.flags, [flag]: enabled };
    this.notify();
  }

  /** Toggle a flag. Notifies all listeners. */
  toggle(flag: string): void {
    this.set(flag, !this.isEnabled(flag));
  }

  /** Bulk update flags. Notifies listeners once. */
  update(patch: Partial<FeatureFlags>): void {
    let changed = false;
    for (const [key, value] of Object.entries(patch)) {
      if (this.flags[key] !== value) {
        changed = true;
        break;
      }
    }
    if (!changed) return;

    this.flags = Object.assign({}, this.flags, patch) as FeatureFlags;
    this.notify();
  }

  /** Load flags from a URL (supports hot-reload via polling). */
  async loadFrom(url: string): Promise<void> {
    try {
      const response = await fetch(url);
      const data = (await response.json()) as Partial<FeatureFlags>;
      this.update(data);
    } catch (err) {
      console.warn('[FeatureFlags] Failed to load from', url, err);
    }
  }

  /** Subscribe to flag changes. Returns unsubscribe function. */
  onChange(listener: FlagChangeListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    const snapshot = this.getAll();
    for (const listener of this.listeners) {
      try {
        listener(snapshot);
      } catch (err) {
        console.error('[FeatureFlags] Listener error:', err);
      }
    }
  }
}
