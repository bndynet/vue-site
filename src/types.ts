import type { App, Component } from 'vue'
import type { UserConfig as ViteUserConfig } from 'vite'

export interface NavItem {
  label: string
  icon?: string
  page?: (() => Promise<{ default: string }>) | (() => Promise<{ default: Component }>)
  children?: NavItem[]
  path?: string
}

/** CSS custom properties for one theme (`--color-bg`, etc.). */
export type ThemePaletteVars = Record<string, string>

/** Extra theme: copies a built-in palette (`basedOn`), then merges `palette`. */
export interface ThemeOption {
  /** Value for `data-theme` and localStorage */
  id: string
  /** Label in the theme switcher */
  label: string
  /** Lucide icon name for the switcher (default: `palette`) */
  icon?: string
  /**
   * Which resolved built-in palette to extend (`light` / `dark`, after `theme.palettes.light` / `.dark`).
   * @default 'light'
   */
  basedOn?: 'light' | 'dark'
  /** Partial CSS variables merged on top of the copied built-in palette */
  palette?: ThemePaletteVars
}

export interface ThemeConfig {
  /**
   * Default theme id. Must be `light`, `dark`, or an `id` from `extraThemes`.
   * @default 'light'
   */
  default?: string
  /**
   * Global CSS variable overrides on `:root`, applied after the active theme palette
   * (useful for a few tweaks shared across themes).
   */
  colors?: Record<string, string>
  /** Themes in addition to built-in `light` and `dark` */
  extraThemes?: ThemeOption[]
  /**
   * Override tokens for the built-in `light` / `dark` palettes only (merged into defaults).
   * Additional themes use `extraThemes[].basedOn` + `extraThemes[].palette`.
   */
  palettes?: {
    light?: ThemePaletteVars
    dark?: ThemePaletteVars
  }
}

export type SiteViteConfig = Partial<Omit<ViteUserConfig, 'root'>> & {
  /** Options passed to @vitejs/plugin-vue (the Vue plugin is added automatically) */
  vue?: Record<string, any>
}

export interface SiteEnvConfig {
  /** Dev server port (default: Vite auto-selects) */
  port?: number
  /** Build output directory relative to site root (CLI default: `{basename}-dist`, e.g. `example-dist`) */
  outDir?: string
  /** Tag prefixes treated as native custom elements (e.g. ['chat-', 'i-']) */
  customElements?: string[]
  /**
   * Local packages to watch for source changes and exclude from pre-bundling.
   * - `string` -- symlinked package name (npm workspaces / npm link)
   * - `{ name, entryPath }` -- resolve imports to a source entry file so Vite compiles it directly (e.g. `'../my-lib/src/index.ts'`)
   */
  watchPackages?: (string | { name: string; entryPath: string })[]
  /** Raw Vite configuration overrides merged into the CLI's base config */
  vite?: SiteViteConfig
}

/** Icon link in the header / theme bar (Lucide icon name + URL). */
export interface SiteExternalLink {
  icon: string
  link: string
  /** Tooltip text on hover; if omitted, the hostname is used when possible */
  title?: string
}

export interface SiteConfig {
  title: string
  logo?: string
  nav: NavItem[]
  theme?: ThemeConfig
  footer?: string
  readme?: string
  /** External links shown as icons next to the theme control */
  links?: SiteExternalLink[]
  /**
   * Normalized repository URL from `package.json` `repository` (parent directory first,
   * then site root). Injected by the `vue-site` CLI; omit when calling `createSiteApp` manually.
   */
  packageRepository?: string | null
  /** Development / build environment configuration */
  env?: SiteEnvConfig
  /**
   * Optional. Path to a module under the site root (Vite `root`), loaded once **before** the Vue app
   * is created. Omit or leave unset to skip. Use for global side effects (polyfills, telemetry,
   * `window` setup). Relative to root, e.g. `./bootstrap.ts` or `src/bootstrap.ts` (resolved as
   * `/bootstrap.ts`, `/src/bootstrap.ts`).
   */
  bootstrap?: string
  /**
   * Called after the app is created, context is provided, and the router is installed — before
   * `createSiteApp` resolves (call `.mount()` after `await`). Use for `app.use()`, global directives, etc.
   */
  configureApp?: (app: App) => void
}

export interface ResolvedNavItem extends NavItem {
  resolvedPath: string
  isHome: boolean
  isGroup: boolean
  resolvedChildren?: ResolvedNavItem[]
}
