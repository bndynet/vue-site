import type { LocaleCode } from './types'

/**
 * Built-in UI strings for framework chrome (theme/locale switchers, page errors). Keyed by locale
 * then message id. Consumers override or extend these per locale via `SiteConfig.i18n.messages`,
 * which is merged on top of these defaults. Unknown locales fall back to `en`.
 *
 * Body strings may contain `{name}` placeholders, interpolated by `useLocalize().t(id, params)`.
 */
export const builtinMessages: Record<LocaleCode, Record<string, string>> = {
  en: {
    'theme.label': 'Theme',
    'theme.options': 'Theme options',
    'theme.light': 'Light',
    'theme.dark': 'Dark',
    'locale.label': 'Language',
    'locale.options': 'Language options',
    'page.notFound': 'Page not found',
    'page.loadErrorTitle': 'Error loading page',
    'page.loadErrorBody': 'Failed to load content for "{label}".',
  },
  zh: {
    'theme.label': '主题',
    'theme.options': '主题选项',
    'theme.light': '浅色',
    'theme.dark': '深色',
    'locale.label': '语言',
    'locale.options': '语言选项',
    'page.notFound': '页面未找到',
    'page.loadErrorTitle': '页面加载失败',
    'page.loadErrorBody': '无法加载“{label}”的内容。',
  },
}
