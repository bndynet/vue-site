export { createSiteApp } from './create-app'
export { useTheme, themeRefKey } from './composables/useTheme'
export { useSiteConfig } from './composables/useSiteConfig'
export { builtinThemePalettes } from './theme/presets'
export {
  ElMessage,
  ElMessageBox,
  ElNotification,
} from 'element-plus'
export type {
  SiteConfig,
  SiteEnvConfig,
  SiteViteConfig,
  SiteExternalLink,
  NavItem,
  ThemeConfig,
  ThemeOption,
  ThemePaletteVars,
  ResolvedNavItem,
} from './types'

import type { SiteConfig } from './types'

export function defineConfig(config: SiteConfig): SiteConfig {
  return config
}
