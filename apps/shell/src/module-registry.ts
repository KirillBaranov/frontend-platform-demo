/**
 * Module registry — declarative configuration of all platform modules.
 *
 * Single source of truth for: which modules exist, their routes,
 * sidebar labels, icons, and lazy-load factories.
 *
 * To add a new module: add an entry here. Nothing else in shell changes.
 */

import type { ModuleDefinition } from '@platform/contracts';

export interface ModuleRegistryEntry {
  /** Unique module identifier. */
  id: string;
  /** Display name in sidebar. */
  label: string;
  /** Route path (hash-based). */
  route: string;
  /** SVG icon markup for sidebar. */
  icon: string;
  /** Lazy-load factory — returns the module definition. */
  factory: () => Promise<{ default: ModuleDefinition }>;
}

/**
 * All registered modules.
 * Order determines sidebar order.
 */
export const MODULE_REGISTRY: ModuleRegistryEntry[] = [
  {
    id: 'catalog',
    label: 'Каталог',
    route: '/catalog',
    icon: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>',
    factory: () => import('@platform/module-catalog'),
  },
  {
    id: 'dashboard',
    label: 'Дашборд',
    route: '/dashboard',
    icon: '<path d="M18 20V10M12 20V4M6 20v-6"/>',
    factory: () => import('@platform/module-dashboard'),
  },
  {
    id: 'orders',
    label: 'Заказы',
    route: '/orders',
    icon: '<path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 14l2 2 4-4"/>',
    factory: () => import('@platform/module-orders'),
  },
  {
    id: 'analytics',
    label: 'Аналитика',
    route: '/analytics',
    icon: '<path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>',
    factory: () => import('@platform/module-analytics'),
  },
];
