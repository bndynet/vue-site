import type { ResolvedNavItem } from './types'

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

export function subtreeContainsPath(item: ResolvedNavItem, path: string): boolean {
  if (item.resolvedPath === path) return true
  if (!item.resolvedChildren?.length) return false
  return item.resolvedChildren.some((c) => subtreeContainsPath(c, path))
}

/** First top-level item whose subtree contains `path` (fallback: first item). */
export function findActiveTopLevelItem(
  items: ResolvedNavItem[],
  path: string,
): ResolvedNavItem | undefined {
  for (const item of items) {
    if (subtreeContainsPath(item, path)) return item
  }
  return items[0]
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
