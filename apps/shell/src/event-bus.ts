/**
 * Typed event bus — the backbone of cross-module communication.
 *
 * Modules publish events and commands through this bus.
 * They never import from each other — only from @platform/contracts.
 *
 * The bus supports versioned events: a v1 consumer and a v2 consumer
 * can coexist. Each receives events matching its subscription type.
 */

import type {
  PlatformEvent,
  PlatformEventType,
  EventOf,
  PlatformCommand,
  PlatformCommandType,
  CommandOf,
  ModuleEventBus,
} from '@platform/contracts';
import type { DevTools } from './devtools.js';

type EventHandler<T extends PlatformEventType> = (event: EventOf<T>) => void;
type CommandHandler<T extends PlatformCommandType> = (command: CommandOf<T>) => void;

export class EventBus implements ModuleEventBus {
  private eventHandlers = new Map<string, Set<EventHandler<any>>>();
  private commandHandlers = new Map<string, CommandHandler<any>>();
  private devtools: DevTools | null = null;

  /** Attach devtools for automatic logging. */
  attachDevTools(devtools: DevTools): void {
    this.devtools = devtools;
  }

  /** Publish an event — all subscribers for this event type are notified. */
  publish(event: PlatformEvent): void {
    const handlers = this.eventHandlers.get(event.type);
    const subscriberCount = handlers?.size ?? 0;
    this.devtools?.log('event', `${event.type} v${event.version}`, `→ ${subscriberCount} subscriber(s)`);

    if (!handlers) return;

    for (const handler of handlers) {
      try {
        handler(event);
      } catch (err) {
        console.error(`[EventBus] Handler error for "${event.type}":`, err);
      }
    }
  }

  /** Subscribe to an event type. Returns an unsubscribe function. */
  subscribe<T extends PlatformEventType>(
    type: T,
    handler: (event: EventOf<T>) => void,
  ): () => void {
    if (!this.eventHandlers.has(type)) {
      this.eventHandlers.set(type, new Set());
    }

    const handlers = this.eventHandlers.get(type)!;
    handlers.add(handler as EventHandler<any>);

    return () => {
      handlers.delete(handler as EventHandler<any>);
      if (handlers.size === 0) {
        this.eventHandlers.delete(type);
      }
    };
  }

  /** Execute a command — routed to the registered handler. */
  execute(command: PlatformCommand): void {
    const handler = this.commandHandlers.get(command.type);
    this.devtools?.log('command', `${command.type} v${command.version}`, handler ? 'handled' : 'no handler');

    if (!handler) {
      console.warn(`[EventBus] No handler registered for command "${command.type}"`);
      return;
    }

    try {
      handler(command);
    } catch (err) {
      console.error(`[EventBus] Command handler error for "${command.type}":`, err);
    }
  }

  /** Register a command handler. Only one handler per command type. */
  registerCommand<T extends PlatformCommandType>(
    type: T,
    handler: (command: CommandOf<T>) => void,
  ): () => void {
    if (this.commandHandlers.has(type)) {
      console.warn(`[EventBus] Overwriting handler for command "${type}"`);
    }
    this.commandHandlers.set(type, handler as CommandHandler<any>);

    return () => {
      this.commandHandlers.delete(type);
    };
  }

  /** Remove all handlers — used during teardown. */
  clear(): void {
    this.eventHandlers.clear();
    this.commandHandlers.clear();
  }
}
