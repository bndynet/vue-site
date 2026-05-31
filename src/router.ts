import {
  createRouter,
  createWebHashHistory,
  type RouterHistory,
  type RouteRecordRaw,
} from 'vue-router'
import type { LocaleCode, NavItem, ResolvedNavItem, StandalonePage } from './types'
import { resolveField, type MessageCatalog } from './i18n-utils'
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

/**
 * Resolve nav items into `ResolvedNavItem`s. Route paths are derived from a **canonical** label
 * string (the `defaultLocale` entry, else the first entry) so that switching language never changes
 * URLs. The original `label` (possibly a `LocalizedString`) is preserved for reactive rendering.
 */
export function resolveNavItems(
  items: NavItem[],
  defaultLocale?: LocaleCode,
  catalog?: MessageCatalog,
  parentIndex?: number,
): ResolvedNavItem[] {
  return items.map((item, index) => {
    const isHome = parentIndex === undefined && index === 0
    const isGroup = !item.page && !!item.children?.length
    const canonicalLabel = resolveField(item.label, defaultLocale ?? '', defaultLocale, catalog)
    const resolvedPath = item.path ?? (isHome ? '/' : toPath(canonicalLabel))
    const resolvedChildren = item.children
      ? resolveNavItems(item.children, defaultLocale, catalog, index)
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

function collectRoutes(
  resolvedNav: ResolvedNavItem[],
  defaultLocale?: LocaleCode,
  catalog?: MessageCatalog,
  prefix = '',
): RouteRecordRaw[] {
  const routes: RouteRecordRaw[] = []

  for (const item of resolvedNav) {
    if (item.link) {
      continue
    } else if (item.isGroup && item.resolvedChildren) {
      routes.push(...collectRoutes(item.resolvedChildren, defaultLocale, catalog, prefix))
    } else {
      const canonicalLabel = resolveField(item.label, defaultLocale ?? '', defaultLocale, catalog)
      routes.push({
        path: prefix + item.resolvedPath,
        name: (prefix ? prefix + ':' : '') + canonicalLabel,
        component: PageView,
        meta: { navItem: item, auth: item.auth },
      })
    }
  }

  return routes
}

export async function createSiteRouter(
  resolvedNav: ResolvedNavItem[],
  pages?: StandalonePage[],
  history?: RouterHistory,
  defaultPath?: string,
  defaultLocale?: LocaleCode,
  catalog?: MessageCatalog,
) {
  const routes = collectRoutes(resolvedNav, defaultLocale, catalog)

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
      meta: { navItem, standalone: true, auth: page.auth },
    })
  }

  const fallbackHome = resolvedNav.length > 0 ? resolvedNav[0].resolvedPath : '/'

  // Prefer the explicit `defaultPath`, but only when it matches a registered, non-redirect
  // route. An unknown target would bounce through the catch-all back to itself, so fall back
  // to the first nav item and warn instead of risking a redirect loop / blank page.
  let homePath = fallbackHome
  if (defaultPath) {
    const matches = routes.some((route) => route.path === defaultPath)
    if (matches) {
      homePath = defaultPath
    } else if (import.meta.env?.DEV) {
      console.warn(
        `[vue-site] defaultPath "${defaultPath}" does not match any registered route; ` +
          `falling back to "${fallbackHome}".`,
      )
    }
  }

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
    history: history ?? createWebHashHistory(),
    routes,
  })
}
