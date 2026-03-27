/**
 * Client-side router — hash-based for simplicity and GitHub Pages compat.
 *
 * Maps URL paths to module IDs. Shell uses this to decide
 * which module to mount/unmount on navigation.
 *
 * Hash-based routing avoids server configuration:
 * - /#/catalog  → module-catalog
 * - /#/dashboard → module-dashboard
 *
 * Can be swapped for History API when a proper server is available.
 */

export type RouteChangeHandler = (moduleId: string, subPath: string) => void;

interface Route {
  moduleId: string;
  path: string;
}

export class Router {
  private routes: Route[] = [];
  private handler: RouteChangeHandler | null = null;
  private currentModuleId: string | null = null;

  /** Register a module route. */
  addRoute(path: string, moduleId: string): void {
    this.routes.push({ path, moduleId });
  }

  /** Set the handler called on every route change. */
  onRouteChange(handler: RouteChangeHandler): void {
    this.handler = handler;
  }

  /** Start listening to hash changes. */
  start(): void {
    window.addEventListener('hashchange', this.handleHashChange);
    // Handle initial route
    this.handleHashChange();
  }

  /** Stop listening. */
  stop(): void {
    window.removeEventListener('hashchange', this.handleHashChange);
  }

  /** Navigate programmatically. */
  navigate(path: string): void {
    window.location.hash = path;
  }

  /** Get current module ID. */
  getCurrentModuleId(): string | null {
    return this.currentModuleId;
  }

  private handleHashChange = (): void => {
    const hash = window.location.hash.slice(1) || '/'; // remove #
    const matched = this.matchRoute(hash);

    if (!matched) {
      // Default to first route
      if (this.routes.length > 0) {
        this.navigate(this.routes[0].path);
      }
      return;
    }

    const subPath = hash.slice(matched.path.length) || '/';
    this.currentModuleId = matched.moduleId;

    if (this.handler) {
      this.handler(matched.moduleId, subPath);
    }
  };

  private matchRoute(hash: string): Route | null {
    // Longest prefix match
    let best: Route | null = null;
    for (const route of this.routes) {
      if (hash.startsWith(route.path)) {
        if (!best || route.path.length > best.path.length) {
          best = route;
        }
      }
    }
    return best;
  }
}
