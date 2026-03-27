import type { ModuleDefinition, ModuleContext, FeatureFlags } from '@platform/contracts';
import '@platform/ui-kit';

let root: import('react-dom/client').Root | null = null;
let currentContext: ModuleContext | null = null;

const ordersModule: ModuleDefinition = {
  id: 'orders',
  name: 'Заказы',
  route: '/orders',
  icon: 'clipboard',

  async mount(container: HTMLElement, context: ModuleContext) {
    currentContext = context;

    const { createRoot } = await import('react-dom/client');
    const { createElement } = await import('react');
    const { App } = await import('./App.js');

    root = createRoot(container);
    root.render(createElement(App, { context }));
  },

  async unmount() {
    if (root) {
      root.unmount();
      root = null;
    }
    currentContext = null;
  },

  onFeatureFlagsChanged(flags: FeatureFlags) {
    if (root && currentContext) {
      const updatedContext = { ...currentContext, featureFlags: flags };
      currentContext = updatedContext;

      import('react').then(({ createElement }) => {
        import('./App.js').then(({ App }) => {
          root!.render(createElement(App, { context: updatedContext }));
        });
      });
    }
  },
};

export default ordersModule;
