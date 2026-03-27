/**
 * Module loader — dynamic import with error isolation.
 *
 * Each module is loaded lazily via import(). If a module crashes during
 * mount, the error is caught and a fallback UI is shown — other modules
 * continue working.
 *
 * This is the core of the micro-frontend architecture:
 * - Modules are loaded on demand (bundle optimization)
 * - Modules are isolated (error in one doesn't break others)
 * - Modules can be different frameworks (React, Vue, etc.)
 */

import type { ModuleDefinition, ModuleContext } from '@platform/contracts';
import type { DevTools } from './devtools.js';

/** Registry of known modules — maps module ID to dynamic import. */
type ModuleFactory = () => Promise<{ default: ModuleDefinition }>;

export class ModuleLoader {
  private registry = new Map<string, ModuleFactory>();
  private loaded = new Map<string, ModuleDefinition>();
  private activeModuleId: string | null = null;
  private devtools: DevTools | null = null;

  /** Attach devtools for automatic logging. */
  attachDevTools(devtools: DevTools): void {
    this.devtools = devtools;
  }

  /** Register a module factory (called at shell startup). */
  register(moduleId: string, factory: ModuleFactory): void {
    this.registry.set(moduleId, factory);
  }

  /** Get all registered module IDs. */
  getRegisteredIds(): string[] {
    return Array.from(this.registry.keys());
  }

  /** Get a loaded module definition (or null if not yet loaded). */
  getLoaded(moduleId: string): ModuleDefinition | null {
    return this.loaded.get(moduleId) ?? null;
  }

  /**
   * Load, mount, and activate a module.
   * Unmounts the previously active module first.
   */
  async mountModule(
    moduleId: string,
    container: HTMLElement,
    context: ModuleContext,
  ): Promise<void> {
    // Unmount current module
    if (this.activeModuleId) {
      await this.unmountCurrent();
    }

    // Show loading state
    container.innerHTML = '<div class="module-loading">Загрузка модуля...</div>';

    try {
      // Load module if not cached
      let definition = this.loaded.get(moduleId);
      if (!definition) {
        const factory = this.registry.get(moduleId);
        if (!factory) {
          throw new Error(`Module "${moduleId}" is not registered`);
        }
        this.devtools?.log('module', `Loading "${moduleId}"...`, 'lazy import');
        const loadStart = performance.now();
        const mod = await factory();
        const loadMs = Math.round(performance.now() - loadStart);
        definition = mod.default;
        this.loaded.set(moduleId, definition);
        this.devtools?.log('module', `Loaded "${moduleId}"`, `${loadMs}ms`);
      } else {
        this.devtools?.log('module', `"${moduleId}" from cache`, 'already loaded');
      }

      // Clear loading state
      container.innerHTML = '';

      // Mount with error isolation
      const mountStart = performance.now();
      await definition.mount(container, context);
      const mountMs = Math.round(performance.now() - mountStart);
      this.activeModuleId = moduleId;
      this.devtools?.log('module', `Mounted "${moduleId}"`, `${mountMs}ms`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.devtools?.log('error', `Failed to mount "${moduleId}"`, message);
      console.error(`[ModuleLoader] Failed to mount "${moduleId}":`, err);
      this.renderError(container, moduleId, err);
    }
  }

  /** Unmount the currently active module. */
  async unmountCurrent(): Promise<void> {
    if (!this.activeModuleId) return;

    const definition = this.loaded.get(this.activeModuleId);
    if (definition) {
      try {
        this.devtools?.log('module', `Unmounting "${this.activeModuleId}"...`);
        await definition.unmount();
      } catch (err) {
        console.error(
          `[ModuleLoader] Error unmounting "${this.activeModuleId}":`,
          err,
        );
      }
    }
    this.activeModuleId = null;
  }

  /** Render error fallback — module crashed but shell survives. */
  private renderError(
    container: HTMLElement,
    moduleId: string,
    error: unknown,
  ): void {
    const message = error instanceof Error ? error.message : String(error);
    container.innerHTML = `
      <div class="module-error">
        <svg class="module-error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <div class="module-error-title">Модуль не загрузился</div>
        <div class="module-error-message">
          Модуль «${moduleId}» столкнулся с ошибкой.<br/>
          Остальные модули продолжают работать.
        </div>
        <pre class="text-xs text-muted" style="max-width:500px;overflow:auto">${message}</pre>
      </div>
    `;
  }
}
