import { createApp, ref } from 'vue'
import { createWebHashHistory, createWebHistory } from 'vue-router'
import ElementPlus from 'element-plus'
import type { SiteConfig } from './types'
import { resolveNavItems, createSiteRouter, filterNavItems } from './router'
import { applyAuthGuard, pruneNavByAuth } from './auth'
import { initTheme, themeRefKey } from './composables/useTheme'
import { siteContextKey } from './composables/useSiteConfig'
import { resolveThemePalettes } from './theme/resolve-palettes'
import AppLayout from './components/AppLayout.vue'

import './styles/base.css'
import './styles/layout.css'
import './styles/markdown.css'
import './styles/code-highlight.css'
import './styles/element-plus-theme.css'

export async function createSiteApp(config: SiteConfig) {
  const visibleNav = await filterNavItems(config.nav)
  const resolvedNav = resolveNavItems(visibleNav)

  // History mode: 'hash' (default) is base-agnostic; 'web' (HTML5) needs the public base, which the
  // CLI injects as `config.baseUrl` (= import.meta.env.BASE_URL) unless `router.base` overrides it.
  const history =
    config.router?.mode === 'web'
      ? createWebHistory(config.router.base ?? config.baseUrl ?? '/')
      : createWebHashHistory()
  const router = await createSiteRouter(resolvedNav, config.pages, history)

  if (config.auth) {
    applyAuthGuard(router, config.auth)
  }

  // Routes are registered from the full `resolvedNav` so guarded pages stay reachable (the guard
  // redirects unauthorized direct access). The menu, however, renders from an auth-filtered list.
  const menuNav = config.auth ? await pruneNavByAuth(resolvedNav, config.auth) : resolvedNav

  const extraThemeIds =
    config.theme?.extraThemes
      ?.filter((t) => t.id !== 'light' && t.id !== 'dark')
      .map((t) => t.id) ?? []
  const themeIds = ['light', 'dark', ...extraThemeIds]
  const palettes = resolveThemePalettes(config.theme)

  const darkThemeIds = new Set<string>(['dark'])
  for (const t of config.theme?.extraThemes ?? []) {
    if (t.basedOn === 'dark') {
      darkThemeIds.add(t.id)
    }
  }

  const themeRef = ref<string>('light')
  initTheme(
    themeRef,
    config.theme?.default ?? 'light',
    themeIds,
    palettes,
    config.theme?.colors,
    darkThemeIds,
  )

  document.title = config.title

  const app = createApp(AppLayout)

  app.provide(themeRefKey, themeRef)
  app.provide(siteContextKey, { config, resolvedNav: menuNav })
  app.use(ElementPlus)
  app.use(router)

  if (config.configureApp) {
    await Promise.resolve(config.configureApp(app))
  }

  return app
}
