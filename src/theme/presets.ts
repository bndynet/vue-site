/** Built-in semantic tokens (same keys as former theme-light / theme-dark CSS). */
export const builtinThemePalettes: {
  light: Record<string, string>
  dark: Record<string, string>
} = {
  light: {
    '--color-bg': '#ffffff',
    '--color-text': '#1a1a2e',
    '--color-text-secondary': '#6b7280',
    '--color-link': '#2563eb',
    '--color-link-hover': '#1d4ed8',

    '--color-sidebar-bg': '#f0f4f8',
    '--color-sidebar-text': '#374151',
    '--color-sidebar-title': '#2563eb',
    '--color-sidebar-item-hover': '#e2e8f0',
    '--color-sidebar-item-active': '#dbeafe',
    '--color-sidebar-item-active-text': '#2563eb',
    '--color-sidebar-border': '#e5e7eb',

    '--color-content-bg': '#ffffff',
    '--color-border': '#e5e7eb',
    '--color-scrollbar': '#cbd5e1',

    '--color-code-bg': '#f6f8fa',
    '--color-code-text': '#24292f',
    '--color-code-block-bg': '#f6f8fa',
    '--color-code-border': '#e5e7eb',

    '--color-table-header-bg': '#f9fafb',
    '--color-table-border': '#e5e7eb',
    '--color-table-row-hover': '#f9fafb',

    '--color-blockquote-border': '#2563eb',
    '--color-blockquote-bg': '#eff6ff',
    '--color-blockquote-text': '#374151',

    '--color-theme-switch-bg': '#e5e7eb',
    '--color-theme-switch-text': '#374151',
    '--color-theme-switch-hover': '#d1d5db',
  },
  dark: {
    '--color-bg': '#0f172a',
    '--color-text': '#e2e8f0',
    '--color-text-secondary': '#94a3b8',
    '--color-link': '#60a5fa',
    '--color-link-hover': '#93bbfd',

    '--color-sidebar-bg': '#1e293b',
    '--color-sidebar-text': '#cbd5e1',
    '--color-sidebar-title': '#60a5fa',
    '--color-sidebar-item-hover': '#334155',
    '--color-sidebar-item-active': '#1e3a5f',
    '--color-sidebar-item-active-text': '#60a5fa',
    '--color-sidebar-border': '#334155',

    '--color-content-bg': '#0f172a',
    '--color-border': '#334155',
    '--color-scrollbar': '#475569',

    '--color-code-bg': '#1e293b',
    '--color-code-text': '#e2e8f0',
    '--color-code-block-bg': '#1e293b',
    '--color-code-border': '#334155',

    '--color-table-header-bg': '#1e293b',
    '--color-table-border': '#334155',
    '--color-table-row-hover': '#1e293b',

    '--color-blockquote-border': '#60a5fa',
    '--color-blockquote-bg': '#1e293b',
    '--color-blockquote-text': '#cbd5e1',

    '--color-theme-switch-bg': '#334155',
    '--color-theme-switch-text': '#cbd5e1',
    '--color-theme-switch-hover': '#475569',
  },
}
