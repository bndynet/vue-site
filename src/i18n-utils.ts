import type { LocaleCode, LocalizedString } from './types'

/**
 * Resolve a `LocalizedString` to a plain string for the active `locale`.
 *
 * A bare `string` is returned unchanged. For a locale map, resolution order is:
 * exact locale → primary-subtag match (e.g. `en-US` → `en`) → `defaultLocale` → first entry → `''`.
 * This keeps single-language configs (plain strings) working without any locale context.
 */
export function resolveLocalized(
  value: LocalizedString | undefined,
  locale: string,
  defaultLocale?: LocaleCode,
): string {
  if (value == null) return ''
  if (typeof value === 'string') return value

  if (locale && value[locale] != null) return value[locale]

  if (locale) {
    const primary = locale.split('-')[0]
    if (value[primary] != null) return value[primary]
    const key = Object.keys(value).find((k) => k.split('-')[0] === primary)
    if (key) return value[key]
  }

  if (defaultLocale && value[defaultLocale] != null) return value[defaultLocale]

  const keys = Object.keys(value)
  return keys.length ? value[keys[0]] : ''
}
