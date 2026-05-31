import type { Component } from 'vue'
import type { LocaleCode, LocalizedString, MessageRef, MessageTree } from './types'

/** Merged, flattened message dictionaries keyed by locale then dotted message id. */
export type MessageCatalog = Record<LocaleCode, Record<string, string>>

/**
 * Flatten a (possibly nested) message tree to dotted ids: `{ site: { title: 'x' } }` → `site.title`.
 * Flat dictionaries pass through unchanged, so both layouts can be mixed.
 */
export function flattenMessages(
  tree: MessageTree | undefined,
  prefix = '',
): Record<string, string> {
  const out: Record<string, string> = {}
  if (!tree) return out
  for (const key of Object.keys(tree)) {
    const value = tree[key]
    const path = prefix ? `${prefix}.${key}` : key
    if (value != null && typeof value === 'object') {
      Object.assign(out, flattenMessages(value, path))
    } else if (value != null) {
      out[path] = String(value)
    }
  }
  return out
}

/** Type guard for a {@link MessageRef} (a `{ $t }` key reference). */
export function isMessageRef(value: unknown): value is MessageRef {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as MessageRef).$t === 'string'
  )
}

/** Build a `MessageRef` referencing a central message id; use in `LocalizedString` config fields. */
export function tk(id: string, params?: Record<string, string | number>): MessageRef {
  return params ? { $t: id, params } : { $t: id }
}

/** Replace `{name}` placeholders from `params`. */
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
 * Merge `override` message trees on top of `base`, per locale, flattening nested groups to dotted
 * ids. Returns a flat {@link MessageCatalog} ready for {@link resolveMessage}.
 */
export function mergeCatalog(
  base: Record<LocaleCode, MessageTree>,
  override?: Record<LocaleCode, MessageTree>,
): MessageCatalog {
  const out: MessageCatalog = {}
  const locales = new Set([
    ...Object.keys(base),
    ...Object.keys(override ?? {}),
  ])
  for (const loc of locales) {
    out[loc] = {
      ...flattenMessages(base[loc]),
      ...flattenMessages(override?.[loc]),
    }
  }
  return out
}

/**
 * Resolve a message id from a merged `catalog` for the active locale, with fallback
 * (exact → primary-subtag → `defaultLocale` → `en` → the id itself) and `{name}` interpolation.
 */
export function resolveMessage(
  catalog: MessageCatalog,
  id: string,
  locale: string,
  defaultLocale?: LocaleCode,
  params?: Record<string, string | number>,
): string {
  let msg = locale ? catalog[locale]?.[id] : undefined

  if (msg == null && locale) {
    const primary = locale.split('-')[0]
    msg = catalog[primary]?.[id]
    if (msg == null) {
      const key = Object.keys(catalog).find((k) => k.split('-')[0] === primary)
      if (key) msg = catalog[key]?.[id]
    }
  }

  if (msg == null && defaultLocale) msg = catalog[defaultLocale]?.[id]
  if (msg == null) msg = catalog['en']?.[id]
  if (msg == null) msg = id

  return interpolate(msg, params)
}

/**
 * Resolve a `LocalizedString` to a plain string for the active `locale`.
 *
 * A bare `string` is returned unchanged. For a locale map, resolution order is:
 * exact locale → primary-subtag match (e.g. `en-US` → `en`) → `defaultLocale` → first entry → `''`.
 * A {@link MessageRef} is returned as its raw id here (use {@link resolveField} with a catalog to
 * resolve it). This keeps single-language configs (plain strings) working without locale context.
 */
export function resolveLocalized(
  value: LocalizedString | undefined,
  locale: string,
  defaultLocale?: LocaleCode,
): string {
  if (value == null) return ''
  if (typeof value === 'string') return value
  if (isMessageRef(value)) return value.$t

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

/**
 * Resolve any `LocalizedString` — including a {@link MessageRef} — against the active locale.
 * Plain strings and locale maps go through {@link resolveLocalized}; key references are resolved
 * from the merged message `catalog` via {@link resolveMessage}.
 */
export function resolveField(
  value: LocalizedString | undefined,
  locale: string,
  defaultLocale?: LocaleCode,
  catalog?: MessageCatalog,
): string {
  if (isMessageRef(value)) {
    return catalog
      ? resolveMessage(catalog, value.$t, locale, defaultLocale, value.params)
      : value.$t
  }
  return resolveLocalized(value, locale, defaultLocale)
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
