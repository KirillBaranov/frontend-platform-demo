/**
 * Auth context — managed by shell, shared with modules.
 *
 * Modules never authenticate themselves. They receive auth state
 * from shell via ModuleContext. This centralizes auth logic and
 * ensures a single source of truth for user identity.
 *
 * Current implementation: mock user for demo purposes.
 * Production: replace with real auth provider (OAuth, SAML, etc.)
 */

import type { AuthContext } from '@platform/contracts';

/** Create a mock auth context for demo/development. */
export function createMockAuth(): AuthContext {
  return {
    token: 'demo-token-2026',
    user: {
      id: 'user-1',
      name: 'Иван Петров',
      role: 'manager',
    },
  };
}

/**
 * In production, this would be:
 *
 * export async function createAuth(provider: AuthProvider): Promise<AuthContext> {
 *   const session = await provider.getSession();
 *   return {
 *     token: session.accessToken,
 *     user: {
 *       id: session.userId,
 *       name: session.displayName,
 *       role: session.role,
 *     },
 *   };
 * }
 */
