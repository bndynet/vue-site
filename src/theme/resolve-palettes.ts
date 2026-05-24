import type { ThemeConfig, ThemeOption } from '../types'
import { builtinExtraThemes, builtinThemePalettes } from './presets'

function mergePalette(
  base: Record<string, string>,
  override?: Record<string, string>,
): Record<string, string> {
  if (!override) return { ...base }
  return { ...base, ...override }
}

/**
 * Full list of extra themes: the always-on built-ins (`sepia`, `ocean`) merged with
 * `theme.extraThemes`. Consumer config wins when reusing a built-in `id`, and the reserved
 * ids `light` / `dark` are excluded.
 */
export function getExtraThemes(theme?: ThemeConfig): ThemeOption[] {
  const byId = new Map<string, ThemeOption>()
  for (const t of builtinExtraThemes) {
    byId.set(t.id, t)
  }
  for (const t of theme?.extraThemes ?? []) {
    byId.set(t.id, t)
  }
  return [...byId.values()].filter((t) => t.id !== 'light' && t.id !== 'dark')
}

/**
 * Full CSS variable map per theme id (light / dark / each extra theme).
 * Extra themes copy resolved `light` or `dark` (see `basedOn`), then merge `palette`.
 */
export function resolveThemePalettes(
  theme?: ThemeConfig,
): Record<string, Record<string, string>> {
  const light = mergePalette(
    builtinThemePalettes.light,
    theme?.palettes?.light,
  )
  const dark = mergePalette(
    builtinThemePalettes.dark,
    theme?.palettes?.dark,
  )

  const out: Record<string, Record<string, string>> = { light, dark }

  const extras = getExtraThemes(theme)

  for (const t of extras) {
    const base = t.basedOn === 'dark' ? dark : light
    out[t.id] = mergePalette(base, t.palette)
  }

  return out
}
