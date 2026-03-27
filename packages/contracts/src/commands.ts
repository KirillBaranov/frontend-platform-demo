/**
 * Typed commands for cross-module imperative actions.
 *
 * Events = "something happened" (past tense, broadcast).
 * Commands = "do this" (imperative, targeted).
 *
 * Commands are versioned following the same pattern as events.
 */

import type { VersionedEvent } from './events.js';

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

export interface NavigateToV1 extends VersionedEvent {
  readonly version: 1;
  readonly type: 'NavigateTo';
  readonly path: string;
  readonly params?: Record<string, string>;
}

export type NavigateTo = NavigateToV1;

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export interface ShowNotificationV1 extends VersionedEvent {
  readonly version: 1;
  readonly type: 'ShowNotification';
  readonly level: 'info' | 'success' | 'warning' | 'error';
  readonly message: string;
  readonly durationMs?: number;
}

export type ShowNotification = ShowNotificationV1;

// ---------------------------------------------------------------------------
// Feature flags
// ---------------------------------------------------------------------------

export interface SetFeatureFlagV1 extends VersionedEvent {
  readonly version: 1;
  readonly type: 'SetFeatureFlag';
  readonly flag: string;
  readonly enabled: boolean;
}

export type SetFeatureFlag = SetFeatureFlagV1;

// ---------------------------------------------------------------------------
// Union
// ---------------------------------------------------------------------------

export type PlatformCommand = NavigateTo | ShowNotification | SetFeatureFlag;

export type PlatformCommandType = PlatformCommand['type'];

export type CommandOf<T extends PlatformCommandType> = Extract<PlatformCommand, { type: T }>;
