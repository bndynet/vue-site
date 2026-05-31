import { useLocale } from './useLocale'
import { useSiteConfig } from './useSiteConfig'
import { resolveLocalized } from '../i18n-utils'
import type { LocalizedString } from '../types'

/**
 * Reactively resolve `LocalizedString` values against the active locale. Returns `localize(value)`,
 * which reads the current locale ref on each call, so using it inside a template/computed makes the
 * output update automatically when the language changes. Falls back to the site's default locale,
 * then the first available entry. Plain strings are returned as-is.
 */
export function useLocalize() {
  const { config } = useSiteConfig()
  const { locale } = useLocale()

  const defaultLocale =
    config.i18n?.defaultLocale ?? config.i18n?.locales?.[0]?.code

  function localize(value: LocalizedString | undefined): string {
    return resolveLocalized(value, locale.value, defaultLocale)
  }

  return { localize, locale }
}
