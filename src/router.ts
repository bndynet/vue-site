import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import type { NavItem, ResolvedNavItem } from './types'
import PageView from './components/PageView.vue'

function toPath(label: string): string {
  return '/' + label.toLowerCase().replace(/\s+/g, '-')
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
    if (item.isGroup && item.resolvedChildren) {
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

export function createSiteRouter(resolvedNav: ResolvedNavItem[]) {
  const routes = collectRoutes(resolvedNav)

  if (resolvedNav.length > 0 && resolvedNav[0].resolvedPath !== '/') {
    routes.push({
      path: '/',
      redirect: resolvedNav[0].resolvedPath,
    })
  }

  return createRouter({
    history: createWebHashHistory(),
    routes,
  })
}
