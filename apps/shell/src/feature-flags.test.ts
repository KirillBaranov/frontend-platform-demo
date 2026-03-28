import { describe, it, expect, vi } from 'vitest';
import { FeatureFlagManager } from './feature-flags.js';

describe('FeatureFlagManager', () => {
  it('loads default flags', () => {
    const mgr = new FeatureFlagManager();
    expect(mgr.isEnabled('network_mode')).toBe(false);
    expect(mgr.isEnabled('trade_in_enabled')).toBe(false);
    expect(mgr.isEnabled('devtools_enabled')).toBe(true);
  });

  it('accepts initial overrides', () => {
    const mgr = new FeatureFlagManager({ trade_in_enabled: true });
    expect(mgr.isEnabled('trade_in_enabled')).toBe(true);
    expect(mgr.isEnabled('network_mode')).toBe(false); // default preserved
  });

  it('set updates a flag', () => {
    const mgr = new FeatureFlagManager();
    mgr.set('network_mode', true);
    expect(mgr.isEnabled('network_mode')).toBe(true);
  });

  it('toggle flips a flag', () => {
    const mgr = new FeatureFlagManager();
    expect(mgr.isEnabled('dark_theme')).toBe(false);
    mgr.toggle('dark_theme');
    expect(mgr.isEnabled('dark_theme')).toBe(true);
    mgr.toggle('dark_theme');
    expect(mgr.isEnabled('dark_theme')).toBe(false);
  });

  it('getAll returns a snapshot (not reference)', () => {
    const mgr = new FeatureFlagManager();
    const snap1 = mgr.getAll();
    mgr.set('dark_theme', true);
    const snap2 = mgr.getAll();
    expect(snap1.dark_theme).toBe(false);
    expect(snap2.dark_theme).toBe(true);
  });

  it('onChange notifies listeners on set', () => {
    const mgr = new FeatureFlagManager();
    const listener = vi.fn();
    mgr.onChange(listener);

    mgr.set('network_mode', true);

    expect(listener).toHaveBeenCalledOnce();
    expect(listener.mock.calls[0][0].network_mode).toBe(true);
  });

  it('onChange does not notify if value unchanged', () => {
    const mgr = new FeatureFlagManager();
    const listener = vi.fn();
    mgr.onChange(listener);

    mgr.set('network_mode', false); // already false

    expect(listener).not.toHaveBeenCalled();
  });

  it('unsubscribe stops notifications', () => {
    const mgr = new FeatureFlagManager();
    const listener = vi.fn();
    const unsub = mgr.onChange(listener);

    unsub();
    mgr.set('network_mode', true);

    expect(listener).not.toHaveBeenCalled();
  });

  it('update applies multiple flags at once', () => {
    const mgr = new FeatureFlagManager();
    const listener = vi.fn();
    mgr.onChange(listener);

    mgr.update({ network_mode: true, trade_in_enabled: true });

    expect(listener).toHaveBeenCalledOnce();
    expect(mgr.isEnabled('network_mode')).toBe(true);
    expect(mgr.isEnabled('trade_in_enabled')).toBe(true);
  });

  it('returns false for unknown flags', () => {
    const mgr = new FeatureFlagManager();
    expect(mgr.isEnabled('nonexistent_flag')).toBe(false);
  });
});
