import { createApp, ref } from 'vue'
import type { SiteConfig } from './types'
import { resolveNavItems, createSiteRouter } from './router'
import { initTheme, themeRefKey } from './composables/useTheme'
import { siteContextKey } from './composables/useSiteConfig'
import { resolveThemePalettes } from './theme/resolve-palettes'
import AppLayout from './components/AppLayout.vue'

import './styles/base.css'
import './styles/layout.css'
import './styles/markdown.css'
import './styles/code-highlight.css'

/** Resolve `bootstrap` path for Vite: root-relative URL starting with `/`. */
function resolveBootstrapUrl(path: string): string {
  const t = path.trim()
  if (!t) throw new Error('[vue-site] bootstrap path is empty')
  if (t.startsWith('/')) return t
  return '/' + t.replace(/^\.\//, '')
}

async function importBootstrap(config: SiteConfig) {
  if (config.bootstrap == null || String(config.bootstrap).trim() === '') return
  const url = resolveBootstrapUrl(String(config.bootstrap))
  await import(/* @vite-ignore */ url)
}

export async function createSiteApp(config: SiteConfig) {
  await importBootstrap(config)

  const resolvedNav = resolveNavItems(config.nav)
  const router = createSiteRouter(resolvedNav)

  const extraThemeIds =
    config.theme?.extraThemes
      ?.filter((t) => t.id !== 'light' && t.id !== 'dark')
      .map((t) => t.id) ?? []
  const themeIds = ['light', 'dark', ...extraThemeIds]
  const palettes = resolveThemePalettes(config.theme)
  const themeRef = ref<string>('light')
  initTheme(
    themeRef,
    config.theme?.default ?? 'light',
    themeIds,
    palettes,
    config.theme?.colors,
  )

  document.title = config.title

  const app = createApp(AppLayout)

  app.provide(themeRefKey, themeRef)
  app.provide(siteContextKey, { config, resolvedNav })
  app.use(router)

  if (config.configureApp) {
    await Promise.resolve(config.configureApp(app))
  }

  return app
}
