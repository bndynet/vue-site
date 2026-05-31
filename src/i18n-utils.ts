import type { Component } from 'vue'
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

/** Pick the best matching key for `locale`: exact → primary-subtag → defaultLocale → first key. */
function resolveKey(
  keys: string[],
  locale: string,
  defaultLocale?: LocaleCode,
): string | undefined {
  if (!keys.length) return undefined

  if (locale && keys.includes(locale)) return locale

  if (locale) {
    const primary = locale.split('-')[0]
    const match = keys.find((k) => k === primary || k.split('-')[0] === primary)
    if (match) return match
  }

  if (defaultLocale && keys.includes(defaultLocale)) return defaultLocale

  return keys[0]
}

/** Options for {@link localizedPage}. */
export interface LocalizedPageOptions {
  /** Locale to fall back to when the active locale has no entry (else the first entry is used). */
  defaultLocale?: LocaleCode
}

/**
 * Build a per-locale page loader for `NavItem.page` / `StandalonePage.page`. Pass a map of locale
 * code → content importer; the returned loader picks the importer matching the active locale, with
 * fallback (exact → primary-subtag → `defaultLocale` → first entry).
 *
 * Prefer this over a dynamic template-literal import (e.g. `` import(`./x.${locale}.md?raw`) ``):
 * the per-locale importers are statically analyzable by Vite and a missing locale degrades to the
 * fallback instead of throwing at runtime.
 *
 * @example
 * page: localizedPage({
 *   en: () => import('./pages/guide.en.md?raw'),
 *   zh: () => import('./pages/guide.zh.md?raw'),
 * })
 */
export function localizedPage(
  loaders: Record<LocaleCode, () => Promise<{ default: string }>>,
  options?: LocalizedPageOptions,
): (locale: LocaleCode) => Promise<{ default: string }>
export function localizedPage(
  loaders: Record<LocaleCode, () => Promise<{ default: Component }>>,
  options?: LocalizedPageOptions,
): (locale: LocaleCode) => Promise<{ default: Component }>
export function localizedPage(
  loaders: Record<LocaleCode, () => Promise<{ default: string | Component }>>,
  options?: LocalizedPageOptions,
): (locale: LocaleCode) => Promise<{ default: string | Component }> {
  const keys = Object.keys(loaders)
  return (locale: LocaleCode) => {
    const key = resolveKey(keys, locale, options?.defaultLocale)
    const loader = key ? loaders[key] : undefined
    if (!loader) {
      return Promise.reject(
        new Error('[vue-site] localizedPage(): no loaders provided.'),
      )
    }
    return loader()
  }
}
