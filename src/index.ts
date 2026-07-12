import 'element-plus/es/components/message/style/css'
import 'element-plus/es/components/message-box/style/css'
import 'element-plus/es/components/notification/style/css'

export { createSiteApp, getSiteConfig } from './create-app'
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
  SiteCustomConfig,
  SiteExternalLink,
  ShellConfig,
  ShellAction,
  ShellActionLoader,
  NavItem,
  StandalonePage,
  PageLayout,
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
  IconRegistry,
  MessageRef,
  MessageTree,
  LocaleOption,
  I18nConfig,
  PageLoader,
} from './types'

import type { SiteConfig } from './types'

/**
 * Type-safe identity for a single config object. Use the single-argument form for a standalone
 * config file.
 *
 * When composing multiple config files (e.g. `site.config.prod.ts` importing a shared
 * `site.config.common.ts`), use the two-argument form so `custom` is deep-merged: properties
 * from the base `custom` are preserved unless explicitly overridden.
 *
 * @example
 * // site.config.common.ts
 * export default defineConfig({ custom: { apiBaseUrl: '/api', appName: 'MyApp' }, ... })
 *
 * // site.config.prod.ts
 * import common from './site.config.common'
 * export default defineConfig(common, { custom: { apiBaseUrl: 'https://prod.example.com/api' } })
 * // Result: custom.apiBaseUrl is overridden, custom.appName is preserved.
 */
export function defineConfig(config: SiteConfig): SiteConfig
export function defineConfig(base: SiteConfig, overrides: Partial<SiteConfig>): SiteConfig
export function defineConfig(
  configOrBase: SiteConfig,
  overrides?: Partial<SiteConfig>,
): SiteConfig {
  if (!overrides) return configOrBase
  return {
    ...configOrBase,
    ...overrides,
    custom: {
      ...(configOrBase.custom || {}),
      ...(overrides.custom || {}),
    } as SiteConfig['custom'],
  }
}
