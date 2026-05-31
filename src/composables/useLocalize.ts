import { useLocale } from './useLocale'
import { useSiteConfig } from './useSiteConfig'
import { resolveLocalized } from '../i18n-utils'
import { builtinMessages } from '../i18n-messages'
import type { LocalizedString } from '../types'

const FALLBACK_LOCALE = 'en'

function interpolate(
  template: string,
  params?: Record<string, string | number>,
): string {
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    key in params ? String(params[key]) : match,
  )
}

/**
 * Reactively resolve localized content against the active locale. Returns:
 *
 * - `localize(value)` — resolve a `LocalizedString` (default-locale / first-entry fallback);
 *   plain strings pass through unchanged.
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
  const userMessages = config.i18n?.messages ?? {}

  function localize(value: LocalizedString | undefined): string {
    return resolveLocalized(value, locale.value, defaultLocale)
  }

  /** User override wins over built-in for a specific (exact) locale key. */
  function lookup(loc: string | undefined, id: string): string | undefined {
    if (!loc) return undefined
    return userMessages[loc]?.[id] ?? builtinMessages[loc]?.[id]
  }

  function t(id: string, params?: Record<string, string | number>): string {
    const loc = locale.value
    let msg = lookup(loc, id)

    if (msg == null && loc) {
      const primary = loc.split('-')[0]
      msg = lookup(primary, id)
      if (msg == null) {
        const keys = new Set([
          ...Object.keys(userMessages),
          ...Object.keys(builtinMessages),
        ])
        for (const key of keys) {
          if (key.split('-')[0] === primary) {
            const found = lookup(key, id)
            if (found != null) {
              msg = found
              break
            }
          }
        }
      }
    }

    if (msg == null) msg = lookup(defaultLocale, id)
    if (msg == null) msg = lookup(FALLBACK_LOCALE, id)
    if (msg == null) msg = id

    return interpolate(msg, params)
  }

  return { localize, t, locale }
}
