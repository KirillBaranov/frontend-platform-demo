/**
 * Shell entry point — wires everything together from declarative config.
 *
 * Modules, routes, and sidebar are driven by MODULE_REGISTRY.
 * To add a module: update module-registry.ts. This file doesn't change.
 *
 * Vanilla TypeScript — zero frameworks. This file should outlive
 * any UI framework migration in the module layer.
 */

import '@platform/ui-kit';
import type { ModuleContext, FeatureFlags } from '@platform/contracts';

import { MODULE_REGISTRY } from './module-registry.js';
import { EventBus } from './event-bus.js';
import { Router } from './router.js';
import { ModuleLoader } from './module-loader.js';
import { FeatureFlagManager } from './feature-flags.js';
import { NotificationManager } from './notification-manager.js';
import { DevTools } from './devtools.js';
import { createMockAuth } from './auth-context.js';
import { t } from './i18n.js';

// ---------------------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------------------

const eventBus = new EventBus();
const router = new Router();
const flags = new FeatureFlagManager({ devtools_enabled: true });
const loader = new ModuleLoader();
const notifications = new NotificationManager();
const devtools = new DevTools();
const auth = createMockAuth();

// Wire devtools into core systems
eventBus.attachDevTools(devtools);
loader.attachDevTools(devtools);

// ---------------------------------------------------------------------------
// Register modules and routes from registry (config-driven)
// ---------------------------------------------------------------------------

const routeMap: Record<string, string> = {};

for (const entry of MODULE_REGISTRY) {
  loader.register(entry.id, entry.factory);
  router.addRoute(entry.route, entry.id);
  routeMap[entry.id] = entry.route;
}

// ---------------------------------------------------------------------------
// Feature flags → notify active module + control devtools
// ---------------------------------------------------------------------------

flags.onChange((newFlags: FeatureFlags) => {
  const changed = Object.entries(newFlags)
    .filter(([key]) => key !== 'devtools_enabled')
    .map(([key, val]) => `${key}=${val}`)
    .join(', ');
  devtools.log('flags', 'Flags updated', changed);

  const activeId = router.getCurrentModuleId();
  if (activeId) {
    const mod = loader.getLoaded(activeId);
    if (mod?.onFeatureFlagsChanged) {
      mod.onFeatureFlagsChanged(newFlags);
    }
  }

  renderFlagToggles();

  if (newFlags.devtools_enabled) {
    devtools.enable();
  } else {
    devtools.disable();
  }
});

// ---------------------------------------------------------------------------
// Wire event bus commands
// ---------------------------------------------------------------------------

eventBus.registerCommand('NavigateTo', (cmd) => {
  router.navigate(cmd.path);
});

eventBus.registerCommand('ShowNotification', (cmd) => {
  notifications.show({
    level: cmd.level,
    message: cmd.message,
    durationMs: cmd.durationMs,
  });
});

eventBus.registerCommand('SetFeatureFlag', (cmd) => {
  flags.set(cmd.flag, cmd.enabled);
});

eventBus.subscribe('Notification', (event) => {
  notifications.show({
    level: event.level,
    message: event.message,
    durationMs: event.durationMs,
  });
});

// ---------------------------------------------------------------------------
// Module context factory
// ---------------------------------------------------------------------------

function createModuleContext(basePath: string): ModuleContext {
  return { eventBus, featureFlags: flags.getAll(), auth, t, basePath };
}

// ---------------------------------------------------------------------------
// Route change → mount module
// ---------------------------------------------------------------------------

const moduleContainer = document.getElementById('module-root')!;

router.onRouteChange(async (moduleId, _subPath) => {
  const context = createModuleContext(routeMap[moduleId] ?? `/${moduleId}`);
  await loader.mountModule(moduleId, moduleContainer, context);
  updateSidebar(moduleId);
});

// ---------------------------------------------------------------------------
// Sidebar — rendered from MODULE_REGISTRY
// ---------------------------------------------------------------------------

function updateSidebar(activeModuleId: string): void {
  document.querySelectorAll('.sidebar-item[data-module]').forEach((el) => {
    el.classList.toggle('active', (el as HTMLElement).dataset.module === activeModuleId);
  });
}

function initSidebar(): void {
  const sidebar = document.getElementById('sidebar')!;

  const moduleLinks = MODULE_REGISTRY.map(
    (entry) => `
      <a class="sidebar-item" href="#${entry.route}" data-module="${entry.id}">
        <svg class="sidebar-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          ${entry.icon}
        </svg>
        ${entry.label}
      </a>`,
  ).join('');

  sidebar.innerHTML = `
    <div class="sidebar-logo">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2">
        <rect x="3" y="3" width="18" height="18" rx="3"/>
        <path d="M9 3v18M3 9h18"/>
      </svg>
      <span>AutoDealer</span>
    </div>
    <div class="sidebar-section">
      <div class="sidebar-section-title">Модули</div>
      ${moduleLinks}
    </div>
    <div class="sidebar-divider"></div>
    <div class="sidebar-section">
      <div class="sidebar-section-title">Пользователь</div>
      <div class="sidebar-item" style="cursor:default">
        <svg class="sidebar-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/>
        </svg>
        ${auth.user.name}
      </div>
    </div>
  `;
}

// ---------------------------------------------------------------------------
// Feature flag toggles in header
// ---------------------------------------------------------------------------

function renderFlagToggles(): void {
  const container = document.getElementById('flag-toggles')!;
  const allFlags = flags.getAll();

  const flagLabels: Record<string, string> = {
    dealer_mode: 'Дилер',
    network_mode: 'Сеть',
    trade_in_enabled: 'Trade-in',
    devtools_enabled: 'DevTools',
  };

  container.innerHTML = Object.entries(flagLabels)
    .map(
      ([key, label]) => `
        <label class="flex items-center gap-2 text-sm" style="cursor:pointer">
          <input type="checkbox" data-flag="${key}" ${allFlags[key] ? 'checked' : ''}/>
          ${label}
        </label>`,
    )
    .join('');

  container.querySelectorAll('input[data-flag]').forEach((input) => {
    input.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      flags.set(target.dataset.flag!, target.checked);
    });
  });
}

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------

function init(): void {
  devtools.init();
  notifications.init();
  initSidebar();
  renderFlagToggles();

  devtools.log('module', 'Shell initialized', 'vanilla TS, zero frameworks');
  devtools.log('module', `Registered: ${MODULE_REGISTRY.map((m) => m.id).join(', ')}`, 'config-driven, lazy-loaded');
  devtools.log('data', 'Data source: mock', 'offline mode, no network');
  devtools.log('flags', 'Feature flags loaded', Object.entries(flags.getAll()).filter(([k]) => k !== 'devtools_enabled').map(([k, v]) => `${k}=${v}`).join(', '));

  if (flags.isEnabled('devtools_enabled')) {
    devtools.enable();
  } else {
    devtools.disable();
  }

  router.start();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
