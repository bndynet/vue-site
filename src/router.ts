import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import type { NavItem, ResolvedNavItem, StandalonePage } from './types'
import PageView from './components/PageView.vue'

function toPath(label: string): string {
  return '/' + label.toLowerCase().replace(/\s+/g, '-')
}

async function isVisible(item: { visible?: () => boolean | Promise<boolean> }): Promise<boolean> {
  if (!item.visible) return true
  return (await Promise.resolve(item.visible())) !== false
}

/**
 * Recursively drop nav items whose `visible()` predicate resolves to `false`. Sibling
 * predicates are evaluated in parallel. A hidden parent removes its subtree; a group left
 * with no children and no own `page`/`link` is pruned. Awaited once at startup.
 */
export async function filterNavItems(items: NavItem[]): Promise<NavItem[]> {
  const visibilities = await Promise.all(items.map(isVisible))

  const result: NavItem[] = []
  for (let i = 0; i < items.length; i++) {
    if (!visibilities[i]) continue
    const item = items[i]

    if (item.children?.length) {
      const children = await filterNavItems(item.children)
      if (!children.length && !item.page && !item.link) continue
      result.push({ ...item, children })
    } else {
      result.push(item)
    }
  }

  return result
}

export function resolveNavItems(items: NavItem[], parentIndex?: number): ResolvedNavItem[] {
  return items.map((item, index) => {
    const isHome = parentIndex === undefined && index === 0
    const isGroup = !item.page && !!item.children?.length
    const resolvedPath = item.path ?? (isHome ? '/' : toPath(item.label))
    const resolvedChildren = item.children
      ? resolveNavItems(item.children, index)
      : undefined

    return {
      ...item,
      resolvedPath,
      isHome,
      isGroup,
      resolvedChildren,
    }
  })
}

function collectRoutes(resolvedNav: ResolvedNavItem[], prefix = ''): RouteRecordRaw[] {
  const routes: RouteRecordRaw[] = []

  for (const item of resolvedNav) {
    if (item.link) {
      continue
    } else if (item.isGroup && item.resolvedChildren) {
      routes.push(...collectRoutes(item.resolvedChildren, prefix))
    } else {
      routes.push({
        path: prefix + item.resolvedPath,
        name: (prefix ? prefix + ':' : '') + item.label,
        component: PageView,
        meta: { navItem: item },
      })
    }
  }

  return routes
}

export async function createSiteRouter(
  resolvedNav: ResolvedNavItem[],
  pages?: StandalonePage[],
) {
  const routes = collectRoutes(resolvedNav)

  for (const page of pages ?? []) {
    if (!(await isVisible(page))) continue
    const navItem: ResolvedNavItem = {
      ...page,
      label: page.path,
      resolvedPath: page.path,
      isHome: false,
      isGroup: false,
    }
    routes.push({
      path: page.path,
      component: PageView,
      meta: { navItem, standalone: true },
    })
  }

  const homePath =
    resolvedNav.length > 0 ? resolvedNav[0].resolvedPath : '/'

  if (homePath !== '/') {
    routes.push({
      path: '/',
      redirect: homePath,
    })
  }

  // Catch-all: hidden (unregistered) or unknown paths redirect to home instead of rendering blank.
  routes.push({
    path: '/:pathMatch(.*)*',
    redirect: homePath,
  })

  return createRouter({
    history: createWebHashHistory(),
    routes,
  })
}
