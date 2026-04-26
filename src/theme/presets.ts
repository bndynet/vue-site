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
