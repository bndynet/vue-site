import type { ThemeConfig } from '../types'
import { builtinThemePalettes } from './presets'

function mergePalette(
  base: Record<string, string>,
  override?: Record<string, string>,
): Record<string, string> {
  if (!override) return { ...base }
  return { ...base, ...override }
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

  const extras =
    theme?.extraThemes?.filter((t) => t.id !== 'light' && t.id !== 'dark') ??
    []

  for (const t of extras) {
    const base = t.basedOn === 'dark' ? dark : light
    out[t.id] = mergePalette(base, t.palette)
  }

  return out
}
