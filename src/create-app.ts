import { createApp, reactive, ref } from 'vue'
import { createWebHashHistory, createWebHistory } from 'vue-router'
import type { ResolvedNavItem, SiteConfig } from './types'
import { resolveNavItems, createSiteRouter, filterNavItems } from './router'
import { applyAuthGuard, pruneNavByAuth } from './auth'
import { initTheme, themeRefKey } from './composables/useTheme'
import { initLocale, localeRefKey } from './composables/useLocale'
import { siteContextKey } from './composables/useSiteConfig'
import { mergeCatalog, resolveField } from './i18n-utils'
import { builtinMessages } from './i18n-messages'
import { getExtraThemes, resolveThemePalettes } from './theme/resolve-palettes'
import AppLayout from './components/AppLayout.vue'

import './styles/base.css'
import './styles/layout.css'
import './styles/markdown.css'
import './styles/code-highlight.css'
import './styles/element-plus-theme.css'

function getConfiguredFavicon(config: SiteConfig) {
  return typeof config.favicon === 'string' ? config.favicon.trim() : ''
}

function applyFavicon(config: SiteConfig) {
  if (typeof document === 'undefined') return

  const favicon = getConfiguredFavicon(config)
  if (!favicon) return

  const existing = document.querySelector<HTMLLinkElement>('link[rel~="icon"]')
  const link = existing ?? document.createElement('link')
  link.rel = 'icon'
  link.href = favicon

  if (!existing) {
    document.head.appendChild(link)
  }
}

export async function createSiteApp(config: SiteConfig) {
  // Canonical locale for stable path/name derivation (independent of the user's current language).
  const defaultLocale = config.i18n
    ? config.i18n.defaultLocale ?? config.i18n.locales[0]?.code
    : undefined

  // Merged message catalog (built-in strings + user `i18n.messages`) so `tk()` key references in
  // config fields (title/label/footer) resolve to stable canonical paths and the initial title.
  const catalog = mergeCatalog(builtinMessages, config.i18n?.messages)

  const visibleNav = await filterNavItems(config.nav)
  const resolvedNav = resolveNavItems(visibleNav, defaultLocale, catalog)

  // History mode: 'hash' (default) is base-agnostic; 'web' (HTML5) needs the public base, which the
  // CLI injects as `config.baseUrl` (= import.meta.env.BASE_URL) unless `router.base` overrides it.
  const history =
    config.router?.mode === 'web'
      ? createWebHistory(config.router.base ?? config.baseUrl ?? '/')
      : createWebHashHistory()
  const router = await createSiteRouter(
    resolvedNav,
    config.pages,
    history,
    config.defaultPath,
    defaultLocale,
    catalog,
  )

  if (config.auth) {
    applyAuthGuard(router, config.auth)
  }

  // Routes are registered from the full `resolvedNav` so guarded pages stay reachable (the guard
  // redirects unauthorized direct access). The menu, however, renders from an auth-filtered list
  // that can be refreshed after login/logout without recreating the app.
  const initialMenuNav = config.auth ? await pruneNavByAuth(resolvedNav, config.auth) : resolvedNav
  const menuNav = reactive<ResolvedNavItem[]>(initialMenuNav)
  let authNavRefreshId = 0

  async function refreshAuthNav() {
    const auth = config.auth
    if (!auth) return
    const refreshId = ++authNavRefreshId
    const nextMenuNav = await pruneNavByAuth(resolvedNav, auth)
    if (refreshId !== authNavRefreshId) return
    menuNav.splice(0, menuNav.length, ...nextMenuNav)
  }

  if (config.auth) {
    router.afterEach(() => {
      void refreshAuthNav()
    })
  }

  // `theme: false` disables theming: a fixed `light` palette is applied (so the CSS-variable
  // driven layout still renders), the switcher is hidden (see AppLayout), and since `light` is
  // the only allowed id nothing is persisted to or read from localStorage.
  const themeConfig = config.theme === false ? undefined : config.theme

  const themeRef = ref<string>('light')
  if (config.theme === false) {
    initTheme(themeRef, 'light', ['light'], resolveThemePalettes(undefined))
  } else {
    const extras = getExtraThemes(themeConfig)
    const themeIds = ['light', 'dark', ...extras.map((t) => t.id)]
    const palettes = resolveThemePalettes(themeConfig)

    const darkThemeIds = new Set<string>(['dark'])
    for (const t of extras) {
      if (t.basedOn === 'dark') {
        darkThemeIds.add(t.id)
      }
    }

    initTheme(
      themeRef,
      themeConfig?.default ?? 'light',
      themeIds,
      palettes,
      themeConfig?.colors,
      darkThemeIds,
    )
  }

  // Locale: when `i18n` is configured, resolve the initial locale (stored > detected > default).
  // The ref is always provided so `useLocale()` and `LocalizedString` resolution work uniformly;
  // without `i18n` it stays empty and resolution falls back to the first available entry.
  const localeRef = ref<string>('')
  if (config.i18n) {
    const codes = config.i18n.locales.map((l) => l.code)
    initLocale(
      localeRef,
      config.i18n.defaultLocale ?? codes[0] ?? '',
      codes,
      config.i18n.detectBrowser ?? true,
      config.i18n.storageKey,
    )
  }

  // Initial document title for the resolved locale; AppLayout keeps it in sync on locale change.
  document.title = resolveField(config.title, localeRef.value, defaultLocale, catalog)
  applyFavicon(config)

  const app = createApp(AppLayout)

  app.provide(themeRefKey, themeRef)
  app.provide(localeRefKey, localeRef)
  app.provide(siteContextKey, { config, resolvedNav: menuNav, refreshAuthNav })
  app.use(router)

  if (config.configureApp) {
    await Promise.resolve(config.configureApp(app))
  }

  return app
}
