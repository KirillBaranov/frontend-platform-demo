/**
 * Module Catalog — React micro-frontend.
 *
 * Exports ModuleDefinition per contract. Shell calls mount/unmount.
 * This module knows nothing about the shell, dashboard, or gateway.
 * It only knows: contracts + data-source + its own React components.
 */

import type { ModuleDefinition, ModuleContext, FeatureFlags } from '@platform/contracts';
import '@platform/ui-kit';

let root: import('react-dom/client').Root | null = null;
let currentContext: ModuleContext | null = null;

const catalogModule: ModuleDefinition = {
  id: 'catalog',
  name: 'Каталог',
  route: '/catalog',
  icon: 'grid',

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
    // Re-render with new flags by remounting
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

export default catalogModule;
