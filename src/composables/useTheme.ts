import { ref } from 'vue'

const STORAGE_KEY = 'vue-site-theme'

const currentTheme = ref<string>('light')

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
  document.documentElement.setAttribute('data-theme', mode)
  currentTheme.value = mode

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
 * @param defaultMode — used when nothing valid is in localStorage
 * @param themeIds — full list of allowed ids (built-in `light`/`dark` plus any `extraThemes`)
 * @param palettes — resolved CSS variable maps per id
 * @param overlay — optional `:root` overrides applied after the active palette
 */
export function initTheme(
  defaultMode: string = 'light',
  themeIds?: readonly string[],
  palettes?: Record<string, Record<string, string>>,
  overlay?: Record<string, string>,
) {
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
  function setTheme(mode: string) {
    if (!allowedThemeIds.includes(mode)) return
    applyTheme(mode)
    storeTheme(mode)
  }

  function toggleTheme() {
    const i = allowedThemeIds.indexOf(currentTheme.value)
    const next =
      allowedThemeIds[(i + 1) % allowedThemeIds.length] ?? currentTheme.value
    setTheme(next)
  }

  return {
    theme: currentTheme,
    setTheme,
    toggleTheme,
  }
}
