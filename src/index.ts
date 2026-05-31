export { createSiteApp } from './create-app'
export { useTheme, themeRefKey } from './composables/useTheme'
export { useLocale, localeRefKey } from './composables/useLocale'
export { useLocalize } from './composables/useLocalize'
export { resolveLocalized, localizedPage } from './i18n-utils'
export type { LocalizedPageOptions } from './i18n-utils'
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
  StandalonePage,
  AuthRule,
  AuthContext,
  AuthConfig,
  RouterConfig,
  ThemeConfig,
  ThemeOption,
  ThemePaletteVars,
  ResolvedNavItem,
  LocaleCode,
  LocalizedString,
  LocaleOption,
  I18nConfig,
  PageLoader,
} from './types'

import type { SiteConfig } from './types'

export function defineConfig(config: SiteConfig): SiteConfig {
  return config
}
