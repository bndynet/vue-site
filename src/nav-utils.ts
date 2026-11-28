import type { RouteLocationNormalized } from 'vue-router'
import type { ResolvedNavItem } from './types'

type NavRoute = Pick<RouteLocationNormalized, 'path' | 'matched' | 'meta'>

/** Deepest path from any root item (1 = only top-level leaves). */
export function maxNavDepth(items: ResolvedNavItem[]): number {
  if (!items.length) return 0
  let max = 1
  for (const item of items) {
    if (item.resolvedChildren?.length) {
      max = Math.max(max, 1 + maxNavDepth(item.resolvedChildren))
    }
  }
  return max
}

/** Match the associated menu page, falling back to the route URL. */
export function matchesNavPath(path: string, route: NavRoute): boolean {
  if (isExternalLink(path)) return false
  const navPath = (route.meta.navItem as ResolvedNavItem | undefined)?.resolvedPath
  const record = route.matched[route.matched.length - 1]
  // A record's own metadata can contain a parameterized path. Keep matching its concrete URL.
  const activePath = navPath && navPath !== record?.path ? navPath : route.path
  return path === activePath
}

export function subtreeContainsRoute(item: ResolvedNavItem, route: NavRoute): boolean {
  if (matchesNavPath(item.link ?? item.resolvedPath, route)) return true
  if (!item.resolvedChildren?.length) return false
  return item.resolvedChildren.some((child) => subtreeContainsRoute(child, route))
}

/** First top-level item whose subtree matches the active route (fallback: first item). */
export function findActiveTopLevelItem(
  items: ResolvedNavItem[],
  route: NavRoute,
): ResolvedNavItem | undefined {
  for (const item of items) {
    if (subtreeContainsRoute(item, route)) return item
  }
  return items[0]
}

/** True for absolute/external links (http(s), protocol-relative, mailto, tel). */
export function isExternalLink(url: string): boolean {
  return /^[a-z][a-z0-9+.-]*:/i.test(url) || url.startsWith('//')
}

/** First routable path in a subtree (for group targets). */
export function getFirstLeafPath(item: ResolvedNavItem): string | null {
  if (item.page) return item.resolvedPath
  if (item.resolvedChildren?.length) {
    for (const c of item.resolvedChildren) {
      const p = getFirstLeafPath(c)
      if (p) return p
    }
  }
  return null
}
