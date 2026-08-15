import type { ThemeOption } from '../types'

/** Seed colors a theme supplies; every other token is derived from these. */
type PaletteSeed = Record<string, string>

/**
 * Builds a full token map from a small set of seed colors.
 *
 * Derived tokens reference other custom properties (e.g. `var(--color-text)`), so they keep
 * following any seed change — per-theme palettes, `theme.palettes`, `theme.colors`, and the
 * Element Plus mappings all stay in sync automatically.
 */
function createPalette(seed: PaletteSeed): Record<string, string> {
  return {
    '--color-text-secondary': 'color-mix(in srgb, var(--color-text) 76%, var(--color-bg))',
    '--color-link': 'var(--color-primary)',
    '--color-link-hover': 'color-mix(in srgb, var(--color-primary) 85%, var(--color-text))',

    '--color-sidebar-bg': 'color-mix(in srgb, var(--color-text) 4%, var(--color-bg))',
    '--color-sidebar-text': 'var(--color-text-secondary)',
    '--color-sidebar-title': 'var(--color-text)',
    '--color-sidebar-item-hover': 'color-mix(in srgb, var(--color-text) 5%, transparent)',
    '--color-sidebar-item-active': 'color-mix(in srgb, var(--color-text) 5%, transparent)',
    '--color-sidebar-item-active-text': 'var(--color-primary)',
    '--color-sidebar-border': 'color-mix(in srgb, var(--color-border) 70%, var(--color-bg))',

    '--color-content-bg': 'var(--color-bg)',
    '--color-border': 'color-mix(in srgb, var(--color-text) 15%, var(--color-bg))',
    '--color-scrollbar': 'color-mix(in srgb, var(--color-text) 30%, var(--color-bg))',

    '--color-code-bg': 'color-mix(in srgb, var(--color-text) 4%, var(--color-bg))',
    '--color-code-text': 'var(--color-text)',
    '--color-code-block-bg': 'var(--color-code-bg)',
    '--color-code-border': 'var(--color-border)',

    '--color-table-header-bg': 'color-mix(in srgb, var(--color-text) 4%, var(--color-bg))',
    '--color-table-border': 'var(--color-border)',
    '--color-table-row-hover': 'var(--color-table-header-bg)',

    '--color-blockquote-border': 'var(--color-border)',
    '--color-blockquote-bg': 'color-mix(in srgb, var(--color-text) 5%, transparent)',
    '--color-blockquote-text': 'color-mix(in srgb, var(--color-text) 85%, var(--color-bg))',

    '--color-theme-switch-bg': 'color-mix(in srgb, var(--color-text) 8%, var(--color-bg))',
    '--color-theme-switch-text': 'var(--color-sidebar-text)',
    '--color-theme-switch-hover': 'color-mix(in srgb, var(--color-text) 16%, var(--color-bg))',

    '--color-success': '#67c23a',
    '--color-warning': '#e6a23c',
    '--color-danger': '#f56c6c',
    '--color-info': '#909399',

    ...seed,
  }
}

/**
 * Built-in semantic tokens. Each theme supplies only seed colors; `createPalette` derives the
 * rest so themes stay small and follow seed overrides automatically. Values may therefore be
 * CSS `color-mix()` / `var()` expressions rather than literal colors.
 */
export const builtinThemePalettes: {
  light: Record<string, string>
  dark: Record<string, string>
} = {
  // Aligned with Infima `:root` (Docusaurus classic default).
  light: createPalette({
    '--color-bg': '#ffffff',
    '--color-text': '#1c1e21',
    '--color-text-secondary': '#525860',
    '--color-primary': '#3578e5',
    '--color-sidebar-bg': '#f5f6f7',
    '--color-sidebar-text': '#606770',
    '--color-sidebar-title': '#1c1e21',
    '--color-border': '#dadde1',
    '--color-surface-raised': '#ffffff',
    '--color-overlay': 'rgba(0, 0, 0, 0.5)',
  }),
  // Aligned with Infima `html[data-theme='dark']` (Docusaurus classic default).
  dark: createPalette({
    '--color-bg': '#1b1b1d',
    '--color-text': '#e3e3e3',
    '--color-text-secondary': '#bec3c9',
    '--color-primary': '#3578e5',
    '--color-sidebar-bg': '#242526',
    '--color-sidebar-text': '#dadde1',
    '--color-sidebar-title': '#3578e5',
    '--color-border': '#444950',
    '--color-code-bg': 'rgba(255, 255, 255, 0.1)',
    '--color-code-block-bg': '#1c1e21',
    '--color-table-header-bg': 'rgba(255, 255, 255, 0.07)',
    '--color-surface-raised': '#242526',
    '--color-overlay': 'rgba(0, 0, 0, 0.8)',
  }),
}

/**
 * Always-on extra themes shipped by the framework, available in the theme switcher for every
 * consumer alongside `light` / `dark`. Consumers can override one by reusing its `id` in
 * `ThemeConfig.extraThemes`.
 */
export const builtinExtraThemes: ThemeOption[] = [
  {
    id: 'sepia',
    label: 'Sepia',
    icon: 'coffee',
    basedOn: 'light',
    palette: {
      '--color-bg': '#f4ecd8',
      '--color-text': '#433d32',
      '--color-text-secondary': '#6b6458',
      '--color-primary': '#a67c52',
      '--color-sidebar-bg': '#ebe4d6',
      '--color-sidebar-text': '#4a443b',
      '--color-sidebar-title': '#a67c52',
      '--color-border': '#d4cbb8',
      '--color-blockquote-border': '#a67c52',
      '--color-blockquote-bg': '#ebe4d6',
      '--color-surface-raised': '#faf3e3',
    },
  },
  {
    id: 'ocean',
    label: 'Ocean',
    icon: 'waves',
    basedOn: 'dark',
    palette: {
      '--color-bg': '#0c1929',
      '--color-text': '#e0f2fe',
      '--color-text-secondary': '#7dd3fc',
      '--color-primary': '#22d3ee',
      '--color-sidebar-bg': '#0f2942',
      '--color-sidebar-text': '#bae6fd',
      '--color-sidebar-title': '#22d3ee',
      '--color-border': '#164e63',
      '--color-blockquote-border': '#22d3ee',
      '--color-code-bg': '#0f2942',
      '--color-code-block-bg': '#0f2942',
      '--color-table-header-bg': '#0f2942',
      '--color-surface-raised': '#0f2942',
    },
  },
]
