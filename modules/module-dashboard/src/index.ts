/**
 * Module Dashboard — Vue micro-frontend.
 *
 * Demonstrates: different framework (Vue), same contract.
 * Listens to events from module-catalog (OrderCreated, VehicleSelected)
 * and updates in real-time — proving cross-framework communication works.
 */

import type { ModuleDefinition, ModuleContext, FeatureFlags } from '@platform/contracts';
import '@platform/ui-kit';

let app: import('vue').App | null = null;
let currentContext: ModuleContext | null = null;

const dashboardModule: ModuleDefinition = {
  id: 'dashboard',
  name: 'Дашборд',
  route: '/dashboard',
  icon: 'chart',

  async mount(container: HTMLElement, context: ModuleContext) {
    currentContext = context;

    const { createApp, h } = await import('vue');
    const { default: App } = await import('./App.vue');

    app = createApp({
      render: () => h(App, { context }),
    });

    app.mount(container);
  },

  async unmount() {
    if (app) {
      app.unmount();
      app = null;
    }
    currentContext = null;
  },

  onFeatureFlagsChanged(flags: FeatureFlags) {
    // Remount with new flags
    if (app && currentContext) {
      const container = app._container as HTMLElement;
      app.unmount();

      const updatedContext = { ...currentContext, featureFlags: flags };
      currentContext = updatedContext;

      import('vue').then(({ createApp, h }) => {
        import('./App.vue').then(({ default: App }) => {
          app = createApp({
            render: () => h(App, { context: updatedContext }),
          });
          app.mount(container);
        });
      });
    }
  },
};

export default dashboardModule;
