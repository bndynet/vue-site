import { inject } from 'vue'
import type { InjectionKey, Ref } from 'vue'

const STORAGE_KEY = 'vue-site-theme'

/** Use `Symbol.for` so the key matches even if multiple copies of this package are resolved. */
export const themeRefKey: InjectionKey<Ref<string>> =
  Symbol.for('vue-site.themeRef')

interface ThemeRuntimeState {
  activeThemeRef: Ref<string> | null
  allowedThemeIds: string[]
  resolvedPalettes: Record<string, Record<string, string>>
  colorOverlay: Record<string, string>
  darkModeIds: ReadonlySet<string>
}

const themeStateKey = Symbol.for('vue-site.themeRuntimeState')

function getThemeState(): ThemeRuntimeState {
  const globalScope = globalThis as typeof globalThis &
    Record<symbol, ThemeRuntimeState | undefined>
  const existing = globalScope[themeStateKey]
  if (existing) return existing

  const state: ThemeRuntimeState = {
    activeThemeRef: null,
    allowedThemeIds: ['light', 'dark'],
    resolvedPalettes: {},
    colorOverlay: {},
    darkModeIds: new Set(['dark']),
  }
  globalScope[themeStateKey] = state
  return state
}

const themeState = getThemeState()

function applyCssVars(vars: Record<string, string>) {
  const root = document.documentElement
  for (const [key, value] of Object.entries(vars)) {
    root.style.setProperty(key, value)
  }
}

function applyTheme(mode: string) {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', mode)
    if (themeState.darkModeIds.has(mode)) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }
  if (themeState.activeThemeRef) {
    themeState.activeThemeRef.value = mode
  }

  const palette = themeState.resolvedPalettes[mode]
  if (palette) {
    applyCssVars(palette)
  }
  if (Object.keys(themeState.colorOverlay).length) {
    applyCssVars(themeState.colorOverlay)
  }
}

function getStoredTheme(): string | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && themeState.allowedThemeIds.includes(stored)) return stored
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
 * @param darkThemeIds — set of theme ids considered "dark" (toggles `html.dark` for Element Plus)
 */
export function initTheme(
  themeRef: Ref<string>,
  defaultMode: string = 'light',
  themeIds?: readonly string[],
  palettes?: Record<string, Record<string, string>>,
  overlay?: Record<string, string>,
  darkThemeIds?: ReadonlySet<string>,
) {
  themeState.activeThemeRef = themeRef

  themeState.allowedThemeIds =
    themeIds?.length && themeIds.length > 0 ? [...themeIds] : ['light', 'dark']

  themeState.resolvedPalettes =
    palettes && Object.keys(palettes).length ? palettes : {}
  themeState.colorOverlay = overlay ? { ...overlay } : {}
  themeState.darkModeIds = darkThemeIds ?? new Set(['dark'])

  const fallback = themeState.allowedThemeIds[0] ?? 'light'
  const resolvedDefault = themeState.allowedThemeIds.includes(defaultMode)
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
    if (!themeState.allowedThemeIds.includes(mode)) return
    applyTheme(mode)
    storeTheme(mode)
  }

  function toggleTheme() {
    const i = themeState.allowedThemeIds.indexOf(theme.value)
    const next =
      themeState.allowedThemeIds[
        (i + 1) % themeState.allowedThemeIds.length
      ] ?? theme.value
    setTheme(next)
  }

  return {
    theme,
    setTheme,
    toggleTheme,
  }
}
