/**
 * Module Template — copy this to create a new micro-frontend.
 *
 * Steps:
 * 1. cp -r modules/module-template modules/module-your-name
 * 2. Update package.json: name → @platform/module-your-name
 * 3. Update id, name, route below
 * 4. Add your framework (React, Vue, Svelte, etc.) to dependencies
 * 5. Implement mount() with your UI
 * 6. Register in apps/shell/src/main.ts
 * 7. Add route in apps/shell/src/main.ts
 *
 * See docs/NEW-MODULE.md for detailed guide.
 */

import type { ModuleDefinition, ModuleContext } from '@platform/contracts';
import '@platform/ui-kit';

const templateModule: ModuleDefinition = {
  id: 'template',
  name: 'New Module',
  route: '/template',

  async mount(container: HTMLElement, context: ModuleContext) {
    container.innerHTML = `
      <div class="flex-col gap-4">
        <h2>New Module</h2>
        <div class="card">
          <div class="card-body">
            <p>This is a starter template. Replace this with your UI.</p>
            <p class="text-sm text-muted mt-2">
              Framework: any (React, Vue, Svelte, vanilla TS)<br/>
              User: ${context.auth.user.name} (${context.auth.user.role})<br/>
              Feature flags: ${JSON.stringify(context.featureFlags)}
            </p>
            <button class="btn btn-primary mt-4" id="template-test-btn">
              Test Event Bus
            </button>
          </div>
        </div>
      </div>
    `;

    container.querySelector('#template-test-btn')?.addEventListener('click', () => {
      context.eventBus.publish({
        version: 1,
        type: 'Notification',
        level: 'success',
        message: 'Event bus works! This notification came from the template module.',
      });
    });
  },

  async unmount() {
    // Cleanup: remove event listeners, timers, etc.
  },
};

export default templateModule;
