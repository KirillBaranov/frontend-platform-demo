# Module Template

Starter template for creating new micro-frontend modules.

## Quick Start

```bash
# 1. Copy this template
cp -r modules/module-template modules/module-your-name

# 2. Update package.json
#    - name: @platform/module-your-name
#    - Add your framework: react, vue, svelte, etc.

# 3. Update src/index.ts
#    - id, name, route
#    - Implement mount() with your UI

# 4. Register in shell
#    apps/shell/src/main.ts:
#      loader.register('your-name', () => import('@platform/module-your-name'));
#      router.addRoute('/your-name', 'your-name');

# 5. Install and run
pnpm install
pnpm start
```

## Contract

Every module must export a `ModuleDefinition`:

```typescript
interface ModuleDefinition {
  id: string;
  name: string;
  route: string;
  mount(container: HTMLElement, context: ModuleContext): void | Promise<void>;
  unmount(): void | Promise<void>;
  onFeatureFlagsChanged?(flags: FeatureFlags): void;  // optional
  onNavigate?(path: string): void;                     // optional
}
```

## What you receive in `context`

- `eventBus` — publish events, subscribe to events from other modules
- `featureFlags` — current feature flag snapshot
- `auth` — user identity (token, name, role)
- `t(key)` — translation function
- `basePath` — your route prefix

## Communication

```typescript
// Publish an event (other modules react)
context.eventBus.publish({
  version: 1,
  type: 'OrderCreated',
  orderId: '123',
  // ...
});

// Subscribe to events
const unsub = context.eventBus.subscribe('VehicleSelected', (event) => {
  console.log('Vehicle selected:', event.vehicleId);
});

// Execute a command
context.eventBus.execute({
  version: 1,
  type: 'ShowNotification',
  level: 'success',
  message: 'Done!',
});
```
