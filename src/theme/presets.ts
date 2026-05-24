import type { ThemeOption } from '../types'

/** Built-in semantic tokens (same keys as former theme-light / theme-dark CSS). */
export const builtinThemePalettes: {
  light: Record<string, string>
  dark: Record<string, string>
} = {
  // Aligned with Infima `:root` (Docusaurus classic default).
  light: {
    '--color-bg': '#ffffff',
    '--color-text': '#1c1e21',
    '--color-text-secondary': '#525860',
    '--color-link': '#3578e5',
    '--color-link-hover': '#306cce',

    '--color-sidebar-bg': '#f5f6f7',
    '--color-sidebar-text': '#606770',
    '--color-sidebar-title': '#1c1e21',
    '--color-sidebar-item-hover': 'rgba(0, 0, 0, 0.05)',
    '--color-sidebar-item-active': 'rgba(0, 0, 0, 0.05)',
    '--color-sidebar-item-active-text': '#3578e5',
    '--color-sidebar-border': '#ebedf0',

    '--color-content-bg': '#ffffff',
    '--color-border': '#dadde1',
    '--color-scrollbar': '#bec3c9',

    '--color-code-bg': '#f6f7f8',
    '--color-code-text': '#1c1e21',
    '--color-code-block-bg': '#f5f6f7',
    '--color-code-border': '#ebedf0',

    '--color-table-header-bg': '#f5f6f7',
    '--color-table-border': '#dadde1',
    '--color-table-row-hover': '#f5f6f7',

    '--color-blockquote-border': '#dadde1',
    '--color-blockquote-bg': 'transparent',
    '--color-blockquote-text': '#444950',

    '--color-theme-switch-bg': '#ebedf0',
    '--color-theme-switch-text': '#606770',
    '--color-theme-switch-hover': '#dadde1',
  },
  // Aligned with Infima `html[data-theme='dark']` (Docusaurus classic default).
  dark: {
    '--color-bg': '#1b1b1d',
    '--color-text': '#e3e3e3',
    '--color-text-secondary': '#bec3c9',
    '--color-link': '#3578e5',
    '--color-link-hover': '#538ce9',

    '--color-sidebar-bg': '#242526',
    '--color-sidebar-text': '#dadde1',
    '--color-sidebar-title': '#3578e5',
    '--color-sidebar-item-hover': 'rgba(255, 255, 255, 0.05)',
    '--color-sidebar-item-active': 'rgba(255, 255, 255, 0.05)',
    '--color-sidebar-item-active-text': '#3578e5',
    '--color-sidebar-border': '#444950',

    '--color-content-bg': '#1b1b1d',
    '--color-border': '#444950',
    '--color-scrollbar': '#686868',

    '--color-code-bg': 'rgba(255, 255, 255, 0.1)',
    '--color-code-text': '#e3e3e3',
    '--color-code-block-bg': '#1c1e21',
    '--color-code-border': '#444950',

    '--color-table-header-bg': 'rgba(255, 255, 255, 0.07)',
    '--color-table-border': '#606770',
    '--color-table-row-hover': 'rgba(255, 255, 255, 0.07)',

    '--color-blockquote-border': '#606770',
    '--color-blockquote-bg': 'rgba(255, 255, 255, 0.05)',
    '--color-blockquote-text': '#ebedf0',

    '--color-theme-switch-bg': '#444950',
    '--color-theme-switch-text': '#dadde1',
    '--color-theme-switch-hover': '#606770',
  },
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
      '--color-link': '#a67c52',
      '--color-link-hover': '#8b6239',
      '--color-sidebar-bg': '#ebe4d6',
      '--color-sidebar-text': '#4a443b',
      '--color-sidebar-title': '#a67c52',
      '--color-sidebar-item-hover': '#ddd4c4',
      '--color-sidebar-item-active': '#e8dfd0',
      '--color-sidebar-item-active-text': '#8b6239',
      '--color-sidebar-border': '#d4cbb8',
      '--color-content-bg': '#f4ecd8',
      '--color-border': '#d4cbb8',
      '--color-scrollbar': '#c4b8a4',
      '--color-code-bg': '#ebe4d6',
      '--color-code-text': '#433d32',
      '--color-code-block-bg': '#ebe4d6',
      '--color-code-border': '#d4cbb8',
      '--color-table-header-bg': '#ebe4d6',
      '--color-table-border': '#d4cbb8',
      '--color-table-row-hover': '#ebe4d6',
      '--color-blockquote-border': '#a67c52',
      '--color-blockquote-bg': '#ebe4d6',
      '--color-blockquote-text': '#4a443b',
      '--color-theme-switch-bg': '#ddd4c4',
      '--color-theme-switch-text': '#4a443b',
      '--color-theme-switch-hover': '#d4cbb8',
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
      '--color-link': '#22d3ee',
      '--color-link-hover': '#67e8f9',
      '--color-sidebar-bg': '#0f2942',
      '--color-sidebar-text': '#bae6fd',
      '--color-sidebar-title': '#22d3ee',
      '--color-sidebar-item-hover': '#164e63',
      '--color-sidebar-item-active': '#155e75',
      '--color-sidebar-item-active-text': '#a5f3fc',
      '--color-sidebar-border': '#164e63',
      '--color-content-bg': '#0c1929',
      '--color-border': '#164e63',
      '--color-scrollbar': '#0e7490',
      '--color-code-bg': '#0f2942',
      '--color-code-text': '#e0f2fe',
      '--color-code-block-bg': '#0f2942',
      '--color-code-border': '#164e63',
      '--color-table-header-bg': '#0f2942',
      '--color-table-border': '#164e63',
      '--color-table-row-hover': '#0f2942',
      '--color-blockquote-border': '#22d3ee',
      '--color-blockquote-bg': '#0f2942',
      '--color-blockquote-text': '#bae6fd',
      '--color-theme-switch-bg': '#164e63',
      '--color-theme-switch-text': '#e0f2fe',
      '--color-theme-switch-hover': '#155e75',
    },
  },
]
