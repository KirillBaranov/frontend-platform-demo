import type { ModuleDefinition, ModuleContext, FeatureFlags } from '@platform/contracts';
import '@platform/ui-kit';

let app: import('vue').App | null = null;
let currentContext: ModuleContext | null = null;

const analyticsModule: ModuleDefinition = {
  id: 'analytics',
  name: 'Аналитика',
  route: '/analytics',
  icon: 'pie-chart',

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

export default analyticsModule;
