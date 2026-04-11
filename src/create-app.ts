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

export function createSiteApp(config: SiteConfig) {
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

  return app
}
