import { useLocale } from './useLocale'
import { useSiteConfig } from './useSiteConfig'
import { mergeCatalog, resolveField, resolveMessage } from '../i18n-utils'
import { builtinMessages } from '../i18n-messages'
import type { LocalizedString } from '../types'

/**
 * Reactively resolve localized content against the active locale. Returns:
 *
 * - `localize(value)` — resolve a `LocalizedString` (locale map, plain string, or a `tk()` key
 *   reference); plain strings pass through unchanged.
 * - `t(id, params?)` — resolve a UI message id from `SiteConfig.i18n.messages` layered over the
 *   framework's built-in strings, with locale fallback (exact → primary-subtag → default → `en`)
 *   and `{name}` placeholder interpolation.
 * - `locale` — the active locale ref.
 *
 * Reading these inside a template/computed makes the output update automatically on language change.
 */
export function useLocalize() {
  const { config } = useSiteConfig()
  const { locale } = useLocale()

  const defaultLocale =
    config.i18n?.defaultLocale ?? config.i18n?.locales?.[0]?.code
  const catalog = mergeCatalog(builtinMessages, config.i18n?.messages)

  function localize(value: LocalizedString | undefined): string {
    return resolveField(value, locale.value, defaultLocale, catalog)
  }

  function t(id: string, params?: Record<string, string | number>): string {
    return resolveMessage(catalog, id, locale.value, defaultLocale, params)
  }

  return { localize, t, locale }
}
