import type { App, Component } from 'vue'
import type { UserConfig as ViteUserConfig } from 'vite'
import type { RouteLocationNormalized } from 'vue-router'

/**
 * Per-page authorization requirement. Attached to a `NavItem` / `StandalonePage` via `auth`
 * and stored on the route's `meta`. It is opaque metadata interpreted by
 * `SiteConfig.auth.authorize` — use `true` for "any authenticated user", a role name or list of
 * roles, or a custom predicate. The framework never inspects the rule itself; it forwards it to
 * `authorize`.
 */
export type AuthRule =
  | boolean
  | string
  | string[]
  | ((ctx: AuthContext) => boolean | Promise<boolean>)

/**
 * Context passed to `SiteConfig.auth.authorize`. `to` / `from` are present when the guard runs
 * during navigation; they are absent while filtering the nav menu.
 */
export interface AuthContext {
  /** The `auth` rule declared on the matched nav / standalone item. */
  rule: AuthRule
  /** The resolved nav item being evaluated, when available. */
  item?: ResolvedNavItem
  /** Target route (navigation-time only). */
  to?: RouteLocationNormalized
  /** Previous route (navigation-time only). */
  from?: RouteLocationNormalized
}

/** Central authorization policy. Configure once in `site.config.ts`; pages opt in with `auth`. */
export interface AuthConfig {
  /**
   * Decide whether the current user may access a route carrying `rule`. Return `true` to allow,
   * `false` to deny, or a path string to redirect (e.g. your login page). Runs at navigation time
   * on every guarded route, and whenever the auth-filtered nav menu is refreshed (with only
   * `rule` / `item`) — there, any result other than `true` hides the item.
   */
  authorize: (ctx: AuthContext) => boolean | string | Promise<boolean | string>
  /**
   * Where to send users when `authorize` returns `false`. The denied target is appended as a
   * `redirect` query param (e.g. `/login?redirect=/admin`). If omitted, denied navigations are
   * simply cancelled.
   */
  loginPath?: string
}

/**
 * Content width mode for a routed page.
 * - `'default'` keeps the standard centered reading width.
 * - `'wide'` uses a wider centered canvas for tables, forms, and dashboards.
 * - `'full'` removes the content max-width and default padding so the page can own the available
 *   parent container.
 */
export type PageLayout = 'default' | 'wide' | 'full'

export interface NavItem {
  /**
   * Display label. Accepts a plain `string`, or a `LocalizedString` map for multi-language sites.
   * Only the menu text is localized — the derived route path stays stable (computed once from the
   * default locale / first entry), so switching language never changes URLs. Set an explicit `path`
   * to control the route directly.
   */
  label: LocalizedString
  icon?: string
  /**
   * Page content for this item's route. Either:
   * - a **loader function** — `() => import('./Page.vue')` / `() => import('./page.md?raw')`, or a
   *   per-locale loader from {@link localizedPage}; or
   * - a **file path string** — e.g. `'./pages/AdminView.vue'` or `'./pages/guide.md'`. The
   *   **vue-site CLI** resolves it exactly like `localizedPage('<path>')`: sibling
   *   `name.<code>.ext` files are auto-imported per locale and a missing locale falls back to the
   *   base file. The string form is CLI-only — in library mode use a loader (or {@link localizedPage}).
   */
  page?: PageLoader | string
  children?: NavItem[]
  path?: string
  /**
   * Content width mode for this page route. Ignored for group-only and link-only items.
   * @default 'default'
   */
  layout?: PageLayout
  /**
   * Render this item as a plain hyperlink instead of a page route. Use an internal route path
   * (e.g. `/landing` to point at a `pages` entry) or an external URL (e.g. `https://...`, opened
   * in a new tab). When set, no `PageView` route is registered for this item and `page`/`children`
   * are ignored for routing.
   */
  link?: string
  /**
   * Optional visibility predicate, awaited once at app startup. Return `false` (or a
   * promise resolving to `false`) to hide this item from navigation. Hidden items also
   * get no route registered, so their pages are not reachable by direct URL. When an item
   * has `children`, a hidden parent hides its whole subtree; a group whose children all
   * become hidden is pruned. Evaluated only at startup, so it does not react to later
   * permission changes (e.g. login/logout) without recreating the app.
   */
  visible?: () => boolean | Promise<boolean>
  /**
   * Per-page authorization rule, interpreted by `SiteConfig.auth.authorize`. Unlike `visible`
   * (a build/startup-time existence switch), `auth` keeps the route registered and is enforced by
   * a navigation guard on every navigation, so it reacts to login/logout and can redirect to a
   * login page. It is also evaluated for the menu whenever auth navigation is refreshed.
   * Requires `SiteConfig.auth` to be set; otherwise it is ignored.
   */
  auth?: AuthRule
}

/**
 * A standalone, full-screen page registered outside the `nav` tree.
 * Standalone pages do not appear in any navigation (no top bar, sidebar, or footer)
 * and render only their content. Use for landing pages, login, embeds, etc.
 */
export interface StandalonePage {
  /** Route path (used as-is, no label-based derivation), e.g. `/landing`. */
  path: string
  /** Page content. Same forms as {@link NavItem.page} (a loader function or a CLI-resolved path string). */
  page: PageLoader | string
  /**
   * Content width mode for this standalone route. Omit to preserve the standalone default: a
   * full-screen, unpadded canvas.
   */
  layout?: PageLayout
  /**
   * Optional visibility predicate, awaited once at app startup. Return `false` (or a
   * promise resolving to `false`) to skip registering this page's route entirely.
   * Evaluated only at startup, so it does not react to later permission changes.
   */
  visible?: () => boolean | Promise<boolean>
  /**
   * Per-page authorization rule, interpreted by `SiteConfig.auth.authorize` and enforced by a
   * navigation guard. See `NavItem.auth`. Requires `SiteConfig.auth` to be set.
   */
  auth?: AuthRule
}

/** A BCP-47 language tag (e.g. `'en'`, `'zh'`, `'zh-CN'`). */
export type LocaleCode = string

/**
 * Loader for a page's content. Returns either a Markdown string (imported with `?raw`) or a Vue
 * component (its `default` export). The active `locale` is passed in, so a loader can return
 * per-language content (e.g. via {@link localizedPage}); single-language loaders may ignore it,
 * which keeps the plain `() => import(...)` form working.
 */
export type PageLoader =
  | ((locale: LocaleCode) => Promise<{ default: string }>)
  | ((locale: LocaleCode) => Promise<{ default: Component }>)

/**
 * A reference to a message id defined centrally in `SiteConfig.i18n.messages` (layered over the
 * framework's built-in strings). Build one with {@link tk} and use it anywhere a `LocalizedString`
 * is accepted (e.g. `title`, `nav[].label`, `footer`) to keep all translations in one message file
 * instead of inlining per-locale text. Resolution uses the active locale with the same fallback as
 * `t()` (exact → primary-subtag → defaultLocale → `en` → the id itself).
 */
export interface MessageRef {
  /** Message id, e.g. `'nav.home'`. */
  $t: string
  /** Optional `{name}` interpolation params. */
  params?: Record<string, string | number>
}

/**
 * A string that may be localized. Use a plain `string` for single-language sites, a map of
 * `LocaleCode -> string` for inline per-language values, or a {@link MessageRef} (via {@link tk})
 * to reference a key from a central message file. When the active locale has no matching entry,
 * the framework falls back to the configured default locale, then to the first available entry.
 * A bare `string` is always returned as-is, so existing single-language configs keep working.
 */
export type LocalizedString = string | Record<LocaleCode, string> | MessageRef

/**
 * Map of Lucide icon names to Vue components. The CLI generates this automatically from every
 * configured icon name so only used icons are bundled. When calling `createSiteApp` directly
 * without the CLI, pass the icons your config references.
 */
export type IconRegistry = Record<string, Component>

/**
 * A dictionary of messages for one locale. Values are either the message string or a nested group,
 * so both flat (`{ 'site.title': '…' }`) and nested (`{ site: { title: '…' } }`) layouts are
 * accepted. Nested groups are flattened to dotted ids (`site.title`) when resolved.
 */
export interface MessageTree {
  [key: string]: string | MessageTree
}

/** One selectable language in the locale switcher. */
export interface LocaleOption {
  /** BCP-47 language tag used as the locale id and persisted to localStorage. */
  code: LocaleCode
  /** Human-readable name shown in the locale switcher (e.g. `English`, `简体中文`). */
  label: string
  /** Optional Lucide icon name for this language (default: a generic `languages` icon). */
  icon?: string
}

/** Internationalization configuration. Omit to disable multi-language support entirely. */
export interface I18nConfig {
  /** Supported languages, in display order. The first entry is the implicit fallback. */
  locales: LocaleOption[]
  /**
   * Initial locale used when nothing valid is persisted and browser detection finds no match.
   * Must be one of `locales[].code`. Defaults to `locales[0].code`.
   */
  defaultLocale?: LocaleCode
  /**
   * Detect the initial locale from `navigator.language(s)` on first visit (before falling back to
   * `defaultLocale`). A previously stored choice always wins over detection.
   * @default true
   */
  detectBrowser?: boolean
  /**
   * localStorage key for persisting the chosen locale.
   * @default 'vue-site-locale'
   */
  storageKey?: string
  /**
   * Override or extend the framework's built-in UI strings, keyed by locale then message id.
   * Merged on top of the framework defaults (and any auto-loaded `locales/<code>.json` files) for
   * that locale. Each locale's messages may be **flat** (`{ 'site.title': '…' }`) or **nested**
   * (`{ site: { title: '…' } }`) — nested trees are flattened to dotted ids, so `tk('site.title')`
   * and `t('site.title')` work either way.
   */
  messages?: Record<LocaleCode, MessageTree>
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
   * Default theme id. Must be `light`, `dark`, a built-in extra theme id (`sepia`, `ocean`),
   * or an `id` from `extraThemes`.
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

/** Router history configuration. */
export interface RouterConfig {
  /**
   * History mode:
   * - `'hash'` (default) — URLs use a `#` fragment (e.g. `/app/#/admin`). Works on any static host
   *   with no server config; route paths are independent of the public base.
   * - `'web'` — HTML5 history with clean URLs (e.g. `/app/admin`). Requires the host to serve
   *   `index.html` for unknown paths (SPA fallback).
   * @default 'hash'
   */
  mode?: 'hash' | 'web'
  /**
   * Base path for `'web'` mode (ignored for `'hash'`). Defaults to the app's public base
   * (`import.meta.env.BASE_URL`, set by the CLI's `--base` / `env.vite.base`). Set this only to
   * override that default (e.g. when calling `createSiteApp` from a custom entry).
   */
  base?: string
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
   * - `{ name, entryPath }` -- resolve imports to a source entry file so Vite compiles it directly; `entryPath` is relative to the directory where you run `vue-site` (the folder that contains `site.config.*`)
   */
  watchPackages?: (string | { name: string; entryPath: string })[]
  /** Raw Vite configuration overrides merged into the CLI's base config */
  vite?: SiteViteConfig
}

/** Icon link in the header / theme bar (Lucide icon name + URL). */
export interface SiteExternalLink {
  icon: string
  link: string
  /**
   * Tooltip text on hover; if omitted, the hostname is used when possible. Accepts a
   * `LocalizedString` for multi-language sites.
   */
  title?: LocalizedString
}

/**
 * Async loader for a custom component rendered in the site shell action area. In CLI mode, a
 * file-path string in `shell.actions` is rewritten to this loader shape automatically.
 */
export type ShellActionLoader = () => Promise<{ default: Component }>

/**
 * Custom Vue component rendered alongside the built-in shell controls. In CLI mode, pass a
 * file-path string such as `'./components/UserAvatar.vue'`; in library mode, pass an imported
 * component or a dynamic import loader.
 */
export type ShellAction = Component | ShellActionLoader | string

/** Site shell action area configuration. */
export interface ShellConfig {
  /**
   * Custom components rendered after the built-in links, locale switcher, and theme switcher.
   * Use this for user avatars, notification buttons, help menus, tenant switchers, and other
   * app-specific controls. Components can read site state with the exported composables.
   */
  actions?: ShellAction[]
  /**
   * Alignment of custom shell actions in the sidebar footer. Top-header rendering keeps the
   * built-in toolbar flow.
   * @default 'center'
   */
  align?: 'left' | 'center' | 'right'
}

/**
 * Consumer-defined public configuration exposed through `useSiteConfig().config.custom`.
 * Extend this interface with TypeScript module augmentation to type application-specific keys.
 * Values are bundled into client code and must not contain secrets.
 */
export interface SiteCustomConfig {
  [key: string]: unknown
}

export interface SiteConfig {
  /** Site title (browser tab + header). Accepts a `LocalizedString` for multi-language sites. */
  title: LocalizedString
  /**
   * Browser tab icon URL. Pass an absolute URL, a public asset path, or an imported asset URL.
   * In CLI mode this is also emitted as a `<link rel="icon">` in the generated HTML when the
   * value is available at config preload time.
  */
  favicon?: string
  logo?: string
  nav: NavItem[]
  /**
   * Navigation placement. Set to `'top'` to force the primary nav into the top header (with the
   * active top-level item's children in the sidebar when present), or `'sidebar'` to force the
   * full nav tree into the sidebar. Omit to keep the default automatic behavior: deeply nested
   * nav trees use the top/tiered layout, while shallow trees use the sidebar-only layout.
   */
  navPosition?: 'top' | 'sidebar'
  /**
   * Path the site opens at: the root `/` and any unknown path redirect here. Must match a
   * registered route — a `nav` item's resolved path or a `pages` entry's `path`.
   * @default the first top-level `nav` item's resolved path
   */
  defaultPath?: string
  /**
   * Standalone, full-screen pages registered outside the `nav` tree. They do not appear in
   * navigation and render with no top bar, sidebar, or footer (content only). The active theme
   * still applies via root CSS variables.
   */
  pages?: StandalonePage[]
  /**
   * Central authorization policy. When set, any `NavItem` / `StandalonePage` carrying an `auth`
   * rule is enforced by a navigation guard (redirecting to `auth.loginPath` on denial) and hidden
   * from the nav menu when not authorized. Omit to disable authorization entirely.
   */
  auth?: AuthConfig
  /** Router history configuration (hash vs HTML5). See `RouterConfig`. */
  router?: RouterConfig
  /**
   * Theme configuration. Built-in themes are `light`, `dark`, plus the always-on extras
   * `sepia` and `ocean`; add more via `extraThemes`. Set to `false` to disable theming
   * entirely — the theme switcher is hidden, a fixed `light` palette is applied, and no
   * theme is persisted to or read from localStorage.
   */
  theme?: ThemeConfig | false
  /**
   * Internationalization configuration. When set, the framework enables a locale switcher,
   * resolves `LocalizedString` config fields against the active locale, and exposes the current
   * locale via `useLocale()`. Omit to keep the site single-language.
   */
  i18n?: I18nConfig
  /** Footer text. Accepts a `LocalizedString` for multi-language sites. */
  footer?: LocalizedString
  readme?: string
  /** External links shown as icons next to the theme control */
  links?: SiteExternalLink[]
  /** Custom controls shown in the shell action area. See `ShellConfig`. */
  shell?: ShellConfig
  /**
   * Lucide icon components used by navigation, links, language choices, and the theme switcher.
   * The CLI injects this automatically from configured icon names. Provide it manually only when
   * calling `createSiteApp` without the CLI.
   */
  icons?: IconRegistry
  /**
   * Normalized repository URL from `package.json` `repository` (parent directory first,
   * then site root). Injected by the `vue-site` CLI; omit when calling `createSiteApp` manually.
   */
  packageRepository?: string | null
  /**
   * App public base path. Injected by the `vue-site` CLI from `import.meta.env.BASE_URL` (the
   * resolved Vite `base`) and used as the default base for `'web'` history mode. Prefer setting
   * `router.base` to override; omit when calling `createSiteApp` manually.
   */
  baseUrl?: string
  /** Development / build environment configuration */
  env?: SiteEnvConfig
  /**
   * Consumer-defined public configuration. The framework preserves these values without
   * interpreting them and exposes them through `useSiteConfig().config.custom`. Values are
   * bundled into client code and must not contain secrets.
   */
  custom?: SiteCustomConfig
  /**
   * Same as `env.watchPackages` (CLI only). Used when `env.watchPackages` is omitted.
   */
  watchPackages?: SiteEnvConfig['watchPackages']
  /**
   * Optional. Path to a module under the site root (Vite `root`), loaded once **before** the Vue app
   * is created. Omit or leave unset to skip. Use for global side effects (polyfills, telemetry,
   * `window` setup). Relative to root, e.g. `./bootstrap.ts` or `src/bootstrap.ts` (resolved as
   * `/bootstrap.ts`, `/src/bootstrap.ts`).
   * The `vue-site` CLI injects a static import for this path so it is included in production builds;
   * if you call `createSiteApp` from a custom entry, import that module yourself before mounting.
   */
  bootstrap?: string
  /**
   * Called after the app is created, context is provided, and the router is installed — before
   * `createSiteApp` resolves (call `.mount()` after `await`). Use for `app.use()`, global directives, etc.
   * May return a Promise (e.g. after `await import()` of a package listed in `env.watchPackages`).
   */
  configureApp?: (app: App) => void | Promise<void>
}

export interface ResolvedNavItem extends NavItem {
  resolvedPath: string
  isHome: boolean
  isGroup: boolean
  resolvedChildren?: ResolvedNavItem[]
}
