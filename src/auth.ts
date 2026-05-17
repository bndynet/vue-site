import type { Router } from 'vue-router'
import type { AuthConfig, AuthRule, ResolvedNavItem } from './types'

/** Query param carrying the originally requested path when redirecting to the login page. */
export const AUTH_REDIRECT_QUERY = 'redirect'

/**
 * Startup-once pass that drops nav items the current user is not authorized to see, so they do not
 * appear in the rendered menu. Mirrors the pruning of `filterNavItems`: a hidden parent removes its
 * subtree, and a group left with no children and no own `page` / `link` is pruned. Routes are not
 * affected (they are still registered by `createSiteRouter`); only the menu list is filtered. An
 * item is shown only when `authorize` returns exactly `true`.
 */
export async function pruneNavByAuth(
  items: ResolvedNavItem[],
  auth: AuthConfig,
): Promise<ResolvedNavItem[]> {
  const result: ResolvedNavItem[] = []

  for (const item of items) {
    const rule = item.auth as AuthRule | undefined
    if (rule != null && rule !== false) {
      const allowed = (await Promise.resolve(auth.authorize({ rule, item }))) === true
      if (!allowed) continue
    }

    if (item.resolvedChildren?.length) {
      const children = await pruneNavByAuth(item.resolvedChildren, auth)
      if (!children.length && !item.page && !item.link) continue
      result.push({ ...item, resolvedChildren: children })
    } else {
      result.push(item)
    }
  }

  return result
}

/**
 * Install a global `beforeEach` guard that enforces a route's `meta.auth` rule at navigation time.
 *
 * - Routes without an `auth` rule (or with `false`) are always allowed.
 * - The configured `loginPath` is always allowed (so the login page itself is reachable; prevents loops).
 * - Otherwise `authorize` is called: `true` allows, a string redirects (to that path; allowed as-is
 *   when it equals the current path to avoid loops), and `false` redirects to `loginPath` with a
 *   `redirect` query of the requested path (or cancels the navigation when no `loginPath` is set).
 */
export function applyAuthGuard(router: Router, auth: AuthConfig): void {
  router.beforeEach(async (to, from) => {
    const rule = to.meta.auth as AuthRule | undefined
    if (rule == null || rule === false) return true
    if (auth.loginPath && to.path === auth.loginPath) return true

    const item = to.meta.navItem as ResolvedNavItem | undefined
    const result = await Promise.resolve(auth.authorize({ rule, item, to, from }))

    if (result === true) return true
    if (typeof result === 'string') {
      return result === to.path ? true : result
    }

    if (auth.loginPath) {
      return { path: auth.loginPath, query: { [AUTH_REDIRECT_QUERY]: to.fullPath } }
    }
    return false
  })
}
