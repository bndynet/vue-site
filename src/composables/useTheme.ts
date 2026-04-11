import { inject } from 'vue'
import type { InjectionKey, Ref } from 'vue'

const STORAGE_KEY = 'vue-site-theme'

/** Use `Symbol.for` so the key matches even if multiple copies of this package are resolved. */
export const themeRefKey: InjectionKey<Ref<string>> =
  Symbol.for('vue-site.themeRef')

let activeThemeRef: Ref<string> | null = null

let allowedThemeIds: string[] = ['light', 'dark']

let resolvedPalettes: Record<string, Record<string, string>> = {}
let colorOverlay: Record<string, string> = {}

function applyCssVars(vars: Record<string, string>) {
  const root = document.documentElement
  for (const [key, value] of Object.entries(vars)) {
    root.style.setProperty(key, value)
  }
}

function applyTheme(mode: string) {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', mode)
  }
  if (activeThemeRef) {
    activeThemeRef.value = mode
  }

  const palette = resolvedPalettes[mode]
  if (palette) {
    applyCssVars(palette)
  }
  if (Object.keys(colorOverlay).length) {
    applyCssVars(colorOverlay)
  }
}

function getStoredTheme(): string | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && allowedThemeIds.includes(stored)) return stored
  } catch {
    // localStorage unavailable
  }
  return null
}

function storeTheme(mode: string) {
  try {
    localStorage.setItem(STORAGE_KEY, mode)
  } catch {
    // localStorage unavailable
  }
}

/**
 * @param themeRef — ref created next to `createApp` so it uses the same Vue runtime as the app (fixes `watch(theme)` when npm/Vite dedupes `vue` imperfectly).
 * @param defaultMode — used when nothing valid is in localStorage
 * @param themeIds — full list of allowed ids (built-in `light`/`dark` plus any `extraThemes`)
 * @param palettes — resolved CSS variable maps per id
 * @param overlay — optional `:root` overrides applied after the active palette
 */
export function initTheme(
  themeRef: Ref<string>,
  defaultMode: string = 'light',
  themeIds?: readonly string[],
  palettes?: Record<string, Record<string, string>>,
  overlay?: Record<string, string>,
) {
  activeThemeRef = themeRef

  allowedThemeIds =
    themeIds?.length && themeIds.length > 0 ? [...themeIds] : ['light', 'dark']

  resolvedPalettes = palettes && Object.keys(palettes).length ? palettes : {}
  colorOverlay = overlay ? { ...overlay } : {}

  const fallback = allowedThemeIds[0] ?? 'light'
  const resolvedDefault = allowedThemeIds.includes(defaultMode)
    ? defaultMode
    : fallback

  const stored = getStoredTheme()
  applyTheme(stored ?? resolvedDefault)
}

export function useTheme() {
  const injected = inject(themeRefKey)
  if (!injected) {
    throw new Error(
      '[vue-site] useTheme() must be used within an app created by createSiteApp().',
    )
  }
  const theme = injected

  function setTheme(mode: string) {
    if (!allowedThemeIds.includes(mode)) return
    applyTheme(mode)
    storeTheme(mode)
  }

  function toggleTheme() {
    const i = allowedThemeIds.indexOf(theme.value)
    const next =
      allowedThemeIds[(i + 1) % allowedThemeIds.length] ?? theme.value
    setTheme(next)
  }

  return {
    theme,
    setTheme,
    toggleTheme,
  }
}
