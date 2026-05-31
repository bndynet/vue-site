import { inject } from 'vue'
import type { InjectionKey, Ref } from 'vue'

const STORAGE_KEY = 'vue-site-locale'

/** Use `Symbol.for` so the key matches even if multiple copies of this package are resolved. */
export const localeRefKey: InjectionKey<Ref<string>> =
  Symbol.for('vue-site.localeRef')

let allowedLocales: string[] = []
let storageKey = STORAGE_KEY

function getStoredLocale(): string | null {
  try {
    const stored = localStorage.getItem(storageKey)
    if (stored && allowedLocales.includes(stored)) return stored
  } catch {
    // localStorage unavailable
  }
  return null
}

function storeLocale(code: string) {
  try {
    localStorage.setItem(storageKey, code)
  } catch {
    // localStorage unavailable
  }
}

/** Match `navigator.language(s)` against the allowed list, preferring exact then primary-subtag. */
function detectBrowserLocale(): string | null {
  if (typeof navigator === 'undefined') return null
  const candidates = [navigator.language, ...(navigator.languages ?? [])].filter(
    Boolean,
  )
  for (const lang of candidates) {
    if (allowedLocales.includes(lang)) return lang
    const primary = lang.split('-')[0]
    const match = allowedLocales.find(
      (l) => l === primary || l.split('-')[0] === primary,
    )
    if (match) return match
  }
  return null
}

/**
 * Resolve and apply the initial locale (stored > detected > default), then keep `localeRef`
 * authoritative. Call once from `createSiteApp` when `i18n` is configured.
 *
 * @param localeRef — ref created next to `createApp` so it uses the same Vue runtime as the app.
 * @param defaultLocale — used when nothing valid is in localStorage and detection finds no match.
 * @param locales — full list of allowed locale codes.
 * @param detectBrowser — try `navigator.language(s)` before falling back to `defaultLocale`.
 * @param key — localStorage key for persistence (default `vue-site-locale`).
 */
export function initLocale(
  localeRef: Ref<string>,
  defaultLocale: string,
  locales: readonly string[],
  detectBrowser = true,
  key: string = STORAGE_KEY,
) {
  allowedLocales = locales.length ? [...locales] : [defaultLocale]
  storageKey = key

  const fallback = allowedLocales.includes(defaultLocale)
    ? defaultLocale
    : (allowedLocales[0] ?? defaultLocale)

  const stored = getStoredLocale()
  const detected = stored ? null : detectBrowser ? detectBrowserLocale() : null
  localeRef.value = stored ?? detected ?? fallback
}

export function useLocale() {
  const injected = inject(localeRefKey)
  if (!injected) {
    throw new Error(
      '[vue-site] useLocale() must be used within an app created by createSiteApp().',
    )
  }
  const locale = injected

  function setLocale(code: string) {
    if (!allowedLocales.includes(code)) return
    locale.value = code
    storeLocale(code)
  }

  function locales() {
    return [...allowedLocales]
  }

  return {
    locale,
    setLocale,
    locales,
  }
}
