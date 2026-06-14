import 'element-plus/es/components/message/style/css'
import 'element-plus/es/components/message-box/style/css'
import 'element-plus/es/components/notification/style/css'

export { createSiteApp } from './create-app'
export { useTheme, themeRefKey } from './composables/useTheme'
export { useLocale, localeRefKey } from './composables/useLocale'
export { useLocalize } from './composables/useLocalize'
export { resolveLocalized, resolveField, resolveMessage, mergeCatalog, flattenMessages, tk, isMessageRef, localizedPage } from './i18n-utils'
export type { LocalizedPageOptions, MessageCatalog } from './i18n-utils'
export { builtinMessages } from './i18n-messages'
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
  ShellConfig,
  ShellAction,
  ShellActionLoader,
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
  MessageRef,
  MessageTree,
  LocaleOption,
  I18nConfig,
  PageLoader,
} from './types'

import type { SiteConfig } from './types'

export function defineConfig(config: SiteConfig): SiteConfig {
  return config
}
