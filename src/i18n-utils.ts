import type { Component } from 'vue'
import type { LocaleCode, LocalizedString, MessageRef, MessageTree, PageLoader } from './types'

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

type PageModuleLoader = () => Promise<{ default: string | Component }>

/**
 * Detect a Vite `import.meta.glob` result vs. an explicit locale map. Glob keys are module paths
 * (always contain `/`, e.g. `../README.zh.md`); locale codes (`en`, `zh`, `zh-TW`) never do.
 */
function isGlobModuleMap(map: Record<string, PageModuleLoader>): boolean {
  const keys = Object.keys(map)
  return keys.length > 0 && keys.every((k) => k.includes('/'))
}

/**
 * Locale code carried by a glob key's file name: `README.md` → none (the base/fallback file),
 * `README.zh.md` / `guide.zh-TW.md` → the segment before the extension. Base name must not contain
 * dots.
 */
function localeFromGlobKey(path: string): LocaleCode | undefined {
  const file = path.slice(path.lastIndexOf('/') + 1)
  const segments = file.split('.')
  segments.pop() // drop the file extension (e.g. `md`, `vue`)
  return segments.length >= 2 ? segments[segments.length - 1] : undefined
}

/**
 * Build a loader from a glob map: pick the file for the active locale (exact → primary-subtag),
 * else fall back to the base file (`README.md`, no locale segment), else the first available file.
 */
function globPageLoader(
  map: Record<string, PageModuleLoader>,
): (locale: LocaleCode) => Promise<{ default: string | Component }> {
  const byLocale: Record<LocaleCode, PageModuleLoader> = {}
  let base: PageModuleLoader | undefined
  for (const path of Object.keys(map)) {
    const locale = localeFromGlobKey(path)
    if (locale) byLocale[locale] = map[path]
    else base = map[path] // file with no locale segment → default/fallback
  }
  const codes = Object.keys(byLocale)
  return (locale: LocaleCode) => {
    if (byLocale[locale]) return byLocale[locale]()
    const primary = locale.split('-')[0]
    const primaryKey = codes.find(
      (c) => c === primary || c.split('-')[0] === primary,
    )
    if (primaryKey) return byLocale[primaryKey]()
    if (base) return base()
    if (codes[0]) return byLocale[codes[0]]()
    return Promise.reject(
      new Error('[vue-site] localizedPage(): no page files matched.'),
    )
  }
}

/** Options for {@link localizedPage}. */
export interface LocalizedPageOptions {
  /** Locale to fall back to when the active locale has no entry (else the first entry is used). */
  defaultLocale?: LocaleCode
}

/**
 * Build a per-locale page loader for `NavItem.page` / `StandalonePage.page`. The returned loader
 * receives the active locale and resolves the matching content, with graceful fallback. Three forms:
 *
 * - **File name** (recommended, simplest) — `localizedPage('../README.md')`. The **vue-site CLI**
 *   rewrites this to a glob, so every `README.<code>.md` sitting next to the base file is picked up
 *   automatically (e.g. `README.zh.md` → `zh`); a locale with no file falls back to the base file
 *   (`README.md`). Add a language by dropping in a file — no config edits. Works for Markdown
 *   (`.md`, loaded as `?raw`) and Vue pages (`.vue`). _Only the CLI understands this form; in
 *   library mode use the glob form below._
 * - **Glob map** — `localizedPage(import.meta.glob('../README*.md', { query: '?raw' }))`. Same
 *   behavior as the file-name form, written explicitly (use this in library mode). Pass a **lazy**
 *   glob whose modules expose `{ default }`.
 * - **Locale map** — `localizedPage({ en: () => import('...'), zh: () => import('...') })` for files
 *   that don't share a base name.
 *
 * @example
 * // Simplest (via the CLI): ../README.md (base) + ../README.zh.md + ../README.ja.md + ...
 * page: localizedPage('../README.md')
 *
 * @example
 * // Explicit locale map
 * page: localizedPage({
 *   en: () => import('./pages/guide.en.md?raw'),
 *   zh: () => import('./pages/guide.zh.md?raw'),
 * })
 */
export function localizedPage(file: string, options?: LocalizedPageOptions): PageLoader
export function localizedPage(
  loaders: Record<LocaleCode, () => Promise<{ default: string }>>,
  options?: LocalizedPageOptions,
): (locale: LocaleCode) => Promise<{ default: string }>
export function localizedPage(
  loaders: Record<LocaleCode, () => Promise<{ default: Component }>>,
  options?: LocalizedPageOptions,
): (locale: LocaleCode) => Promise<{ default: Component }>
export function localizedPage(
  source:
    | string
    | Record<LocaleCode, () => Promise<{ default: string | Component }>>,
  options?: LocalizedPageOptions,
): (locale: LocaleCode) => Promise<{ default: string | Component }> {
  // File-name form. Reached only when the CLI did NOT rewrite the call (e.g. library mode), since
  // the CLI replaces the string literal with an `import.meta.glob(...)` map at build time.
  if (typeof source === 'string') {
    return () =>
      Promise.reject(
        new Error(
          `[vue-site] localizedPage('${source}') is resolved by the vue-site CLI. ` +
            `In library mode, pass a glob instead, e.g. ` +
            `localizedPage(import.meta.glob('${source.replace(/(\.[^./]+)$/, '*$1')}', { query: '?raw' })).`,
        ),
      )
  }

  // Glob map (from `import.meta.glob` or the CLI-rewritten file-name form): keys are file paths.
  if (isGlobModuleMap(source)) return globPageLoader(source)

  // Explicit locale map.
  const loaders = source
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
