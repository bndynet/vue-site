# @bndynet/vue-site

Configurable Vue 3 site framework: one package, `site.config.ts`, and Markdown pages — sidebar, syntax-highlighted code, light/dark themes. No hand-written `main.ts`, `index.html`, or `vite.config.ts`.

## Features

- Config-driven nav (Lucide icon names)
- Permission-gated nav via a `visible` predicate (sync or async; hides item and skips its route)
- Per-page authorization via `auth` + a central `authorize` policy (navigation guard + login redirect)
- Hash or HTML5 (`web`) router history, configurable in `site.config.ts`
- Markdown (`?raw`) or Vue pages
- highlight.js, light/dark theme + localStorage
- Custom shell actions for avatars, notifications, help menus, and other app controls
- Built-in multi-language support (locale switcher, `LocalizedString` config, per-locale pages) — see [Internationalization](#internationalization-i18n)
- Project `README.md` as Home
- Full TypeScript types

## Quick start

**Install**

```bash
npm install @bndynet/vue-site
```

**`site.config.ts`**

```typescript
import { defineConfig } from '@bndynet/vue-site'

export default defineConfig({
  title: 'My Project',
  favicon: '/favicon.ico',
  nav: [
    { label: 'Home', icon: 'home', page: () => import('./README.md?raw') },
    { label: 'Guide', icon: 'book-open', page: () => import('./pages/guide.md?raw') },
  ],
})
```

**Layout**

```
my-site/
  package.json
  site.config.ts
  public/favicon.ico
  README.md
  pages/guide.md
```

**CLI** (`vue-site` and `vs` are the same)

```bash
npx vue-site dev
npx vue-site build
npx vue-site preview
```

Subpath deploy: pass Vite’s public base on the CLI (overrides `env.vite.base` in `site.config`):

```bash
npx vue-site build --base=/app/
# or
npx vue-site build --base /app/
```

Add `"dev": "vue-site dev"` (or `vs dev`) in `package.json` scripts if you like.

## Config reference

### `SiteConfig`

| Property | Description |
|----------|-------------|
| `title` | Site title (sidebar + tab). `LocalizedString` |
| `nav` | `NavItem[]` |
| `navPosition` | Optional navigation placement: `'top'` forces the top/tiered layout, `'sidebar'` forces the full nav tree into the sidebar. Omit to keep automatic behavior based on nav depth |
| `defaultPath` | Path the site opens at; `/` and unknown paths redirect here. Must match a registered route (a `nav` item's resolved path or a `pages` entry's `path`). Defaults to the first top-level `nav` item |
| `favicon` | Browser tab icon URL. Use a public asset path, remote URL, or imported asset URL |
| `logo` | Logo URL or imported image |
| `theme` | See `ThemeConfig` below; set to `false` to disable theming (hides the switcher, forces a fixed `light` palette, no localStorage persistence) |
| `i18n` | Multi-language config (`I18nConfig`) — see [Internationalization](#internationalization-i18n) |
| `footer` | Footer text. `LocalizedString` |
| `readme` | Raw Home content if no `README.md` |
| `links` | Header links: Lucide `icon` + `link`, optional `title` (`LocalizedString`) |
| `shell` | Shell action area config (`ShellConfig`) — see [Shell actions](#shell-actions-shellactions) |
| `pages` | `StandalonePage[]` — full-screen routes outside the `nav` tree (no top bar/sidebar/footer) |
| `auth` | Central authorization policy (`AuthConfig`) — see [Per-page authorization](#per-page-authorization-auth) |
| `router` | History mode (`RouterConfig`) — `hash` (default) or HTML5 `web`; see [Router history](#router-history-router) |
| `packageRepository` | Usually set by CLI from `package.json`; omit when using `createSiteApp` alone |
| `env` | Dev/build options — see below |
| `bootstrap` | Optional path from site root (e.g. `./bootstrap.ts`) — module loaded once before the Vue app |
| `configureApp` | Optional `(app) => void \| Promise<void>` after router install, before `mount` (see [Local packages in `configureApp`](#local-packages-in-configureapp)) |

### `NavItem`

| Property | Description |
|----------|-------------|
| `label` | Sidebar text. `LocalizedString` |
| `icon` | [Lucide](https://lucide.dev/icons) name |
| `page` | Page content. Simplest is a **file-path string** like `'./pages/AdminView.vue'` or `'./README.md'` (auto-loads per-locale siblings, falls back to the base file). Also accepts a loader (`() => import('./Page.vue')` / `() => import('./page.md?raw')`) or a `localizedPage(...)` result. See [Per-locale page content](#per-locale-page-content) and [Advanced page loaders](#advanced-page-loaders) |
| `path` | Route path (derived from `label`'s default-locale value if omitted; stays stable across languages) |
| `layout` | Page content width: `'default'` keeps the standard centered reading width, `'wide'` uses a wider centered canvas, `'full'` fills the available parent container with no framework padding. Ignored for groups and links. |
| `children` | Nested group |
| `link` | Render as a hyperlink (internal route path or external URL) instead of a page route |
| `visible` | `() => boolean \| Promise<boolean>`, awaited once at startup. Return `false` to hide the item from the nav and skip its route (not reachable by direct URL). A hidden parent hides its subtree; a group with no remaining children is pruned. Not reactive to later changes. |
| `auth` | Authorization rule (`AuthRule`) interpreted by `auth.authorize`. Keeps the route registered and enforces it via a navigation guard (so direct URLs redirect to login). Requires `SiteConfig.auth`. See [Per-page authorization](#per-page-authorization-auth). |

### `StandalonePage`

| Property | Description |
|----------|-------------|
| `path` | Route path, used as-is (e.g. `/landing`) |
| `page` | Page content. Same forms as `NavItem.page` |
| `layout` | Optional content width. Omit to keep the standalone default: a full-screen, unpadded canvas. |
| `visible` | `() => boolean \| Promise<boolean>`, awaited once at startup. Return `false` to skip registering the route. |
| `auth` | Authorization rule (`AuthRule`) enforced by the same navigation guard as `NavItem.auth`. |

### Page layout

Set `layout` on a `NavItem` page when the default reading width is too narrow:

```typescript
export default defineConfig({
  nav: [
    { label: 'Docs', icon: 'book', page: './pages/docs.md' },
    { label: 'Reports', icon: 'table', layout: 'wide', page: './pages/reports.vue' },
    { label: 'Dashboard', icon: 'gauge', layout: 'full', page: './pages/dashboard.vue' },
  ],
})
```

### `ThemeConfig`

Built-in themes are `light`, `dark`, plus the always-on extras `sepia` and `ocean` (shown in the switcher for every site). Set `theme: false` on `SiteConfig` to disable theming entirely.

| Property | Default | Description |
|----------|---------|-------------|
| `default` | `light` | `light`, `dark`, a built-in extra id (`sepia`, `ocean`), or an `extraThemes[].id` |
| `colors` | — | Global CSS variable overrides |
| `palettes` | — | Partial overrides for built-in light/dark only |
| `extraThemes` | — | Extra themes: `id`, `label`, `icon`, optional `basedOn`, `palette`; reuse a built-in id (`sepia`/`ocean`) to override it. Import `builtinThemePalettes` for full defaults |

## Shell actions (`shell.actions`)

Use `shell.actions` to render app-specific Vue components in the active layout's global toolbar.
In top/tiered navigation they appear at the end of the top header; in sidebar-only navigation they
appear in the sidebar footer after the built-in links, locale switcher, and theme switcher. This is
the recommended place for a signed-in user avatar, notification button, help menu, or tenant
switcher.

```typescript
export default defineConfig({
  title: 'My Site',
  shell: {
    actions: ['./components/UserAvatar.vue'],
    align: 'left',
  },
  nav: [/* ... */],
})
```

With the CLI, each path-like string is rewritten to a dynamic import. In library mode, pass an
imported component or loader instead:

```typescript
import UserAvatar from './components/UserAvatar.vue'

export default defineConfig({
  shell: {
    actions: [UserAvatar, () => import('./components/HelpMenu.vue')],
    align: 'center',
  },
  nav: [/* ... */],
})
```

The framework only renders the component; auth state, user data, menus, and logout behavior stay in
your component so the framework does not need to define a user model.
Set `align` to `'left'`, `'center'`, or `'right'` for sidebar-footer placement; it defaults to
`'center'`. Top-header placement keeps the built-in toolbar flow.

## Internationalization (`i18n`)

Set `i18n` to enable multi-language support. The framework adds a locale switcher to the header,
resolves every `LocalizedString` field (`title`, `nav[].label`, `footer`, `links[].title`) against
the active locale, and exposes the current locale via `useLocale()` / `useLocalize()`.

```typescript
import { defineConfig } from '@bndynet/vue-site'

export default defineConfig({
  i18n: {
    locales: [
      { code: 'en', label: 'English' },
      { code: 'zh', label: '简体中文', icon: 'languages' },
    ],
    defaultLocale: 'en',
  },
  title: { en: 'My Site', zh: '我的站点' }, // a LocalizedString
  footer: { en: '© 2026', zh: '© 2026 版权所有' },
  nav: [
    { label: { en: 'Home', zh: '首页' }, icon: 'home', page: '../README.md' },
    {
      label: { en: 'Guide', zh: '指南' },
      icon: 'book',
      // Per-locale content: ./pages/guide.md (base) + guide.zh.md, auto-discovered by the CLI.
      page: './pages/guide.md',
    },
  ],
})
```

### Per-locale page content

Point `page` at a **file-path string** and the framework serves the right file for the active
locale — no extra wiring:

```typescript
import { defineConfig, tk } from '@bndynet/vue-site'

export default defineConfig({
  i18n: { locales: [{ code: 'en' }, { code: 'zh' }], defaultLocale: 'en' },
  nav: [
    // Loads ../README.md, and auto-uses ../README.zh.md when the active locale is `zh`.
    { label: tk('nav.home'), icon: 'home', page: '../README.md' },
    // Vue pages work the same way: Dashboard.vue + Dashboard.zh.vue.
    { label: tk('nav.dash'), icon: 'gauge', page: './pages/Dashboard.vue' },
  ],
})
```

- Name the variants `name.<code>.<ext>` next to the base file — `README.zh.md`, `Dashboard.zh.vue`, …
- A locale with no matching file falls back to the **base file** (`README.md`). Resolution order:
  exact → primary-subtag (`zh-TW` → `zh`) → base file.
- **Add a language by dropping in a `name.<code>` file — no config changes.**
- Works for Markdown (`.md`) and Vue (`.vue`). The base name must not contain dots (`README.md` ✓,
  `my.page.md` ✗).

> The string form is resolved by the `vue-site` CLI at build time. If you embed the library yourself
> (no CLI — see [library mode](#library-mode)), use a loader from
> [Advanced page loaders](#advanced-page-loaders) instead.

### Advanced page loaders

> **Rarely needed.** The file-path string above covers most sites. Reach for these only when you
> want a plain single-file loader, files that **don't** share a base name, or you run **without** the
> CLI (library mode).

Besides a string, `page` accepts a **loader function** or a `localizedPage(...)` result:

- **Single file, no localization** — a plain dynamic import:

  ```typescript
  page: () => import('./pages/Dashboard.vue')   // or () => import('./guide.md?raw') for Markdown
  ```

- **Explicit locale map** — for files that don't share a base name (so the string form can't infer
  them):

  ```typescript
  import { localizedPage } from '@bndynet/vue-site'

  page: localizedPage({
    en: () => import('./pages/guide-en.md?raw'),
    zh: () => import('./pages/guide-zh.md?raw'),
  })
  ```

- **Glob (library mode)** — the same auto-discovery as the string form, written out so it works
  without the CLI:

  ```typescript
  page: localizedPage(import.meta.glob(['../README.md', '../README.*.md'], { query: '?raw' }))
  ```

  `page: '../README.md'` is exactly this, generated for you by the CLI. (For Vue pages drop the
  `{ query: '?raw' }`.)

All `localizedPage` forms fall back when the active locale has no file (exact → primary-subtag →
base file → first entry).

### How it works

- **Initial locale**: stored choice (localStorage) > browser language (`navigator.language`, when
  `detectBrowser` is on) > `defaultLocale` > first entry.
- **`LocalizedString`** is `string | Record<LocaleCode, string> | MessageRef`. A plain string is
  returned as-is (single-language configs keep working), a locale map holds inline per-language
  text, and a `MessageRef` (built with `tk('id')`) references a key from a central message file —
  see [Centralized message files](#centralized-message-files-tk--t).
- **Stable URLs**: route paths derive from the **default-locale** label (or an explicit `path`), so
  switching language never changes URLs.
- **Reactive**: switching language updates labels, the title, the footer, and page content live
  (page content reloads via `localizedPage`). The switcher only appears when `locales.length > 1`.
- **UI strings**: the framework ships built-in strings (currently `en`, `zh`) for the theme/locale
  switchers and page errors; override or extend them per locale via `i18n.messages`.

### `I18nConfig`

| Property | Default | Description |
|----------|---------|-------------|
| `locales` | discovered `locales/*.json` | `{ code, label, icon? }[]` — supported languages, in display order. Optional: derived from the auto-loaded file names (with built-in labels) when omitted. First entry is the fallback |
| `defaultLocale` | `locales[0].code` | Initial locale when nothing is stored and detection finds no match |
| `detectBrowser` | `true` | Detect the initial locale from `navigator.language(s)` on first visit |
| `storageKey` | `vue-site-locale` | localStorage key for the chosen locale |
| `messages` | auto-loaded from `locales/<code>.json` | `Record<LocaleCode, Record<string, string>>` — extra/override translations, merged over the auto-loaded files and built-in UI strings |

### Message files & keys (`tk` / `t`)

Instead of inlining `{ en, zh }` everywhere, keep all translations in plain JSON — **one file per
language** — and reference them by key. This is zero-config: the CLI auto-discovers
`locales/<code>.json` next to your `site.config.ts`. You don't write any glue code (no `index.ts`,
no `messages` field) and you don't even have to list the languages.

```jsonc
// locales/en.json — nested groups (recommended), flattened to dotted ids
{
  "site": { "title": "My Site" },
  "nav": { "home": "Home", "guide": "Guide" }
}
```

```jsonc
// locales/zh.json
{
  "site": { "title": "我的站点" },
  "nav": { "home": "首页", "guide": "指南" }
}
```

> Files may be **nested** (above) or **flat** (`{ "site.title": "My Site" }`) — nested groups are
> flattened to dotted ids, so `tk('site.title')` / `t('site.title')` work either way.

```typescript
// site.config.ts — reference keys with tk() in config and t() in pages
import { defineConfig, tk } from '@bndynet/vue-site'

export default defineConfig({
  // `i18n` can be omitted entirely: the language list is derived from the file names
  // (en, zh, ...) with friendly built-in labels. Declare it only to customize label/icon/order.
  i18n: {
    locales: [
      { code: 'en', label: 'English' },
      { code: 'zh', label: '简体中文', icon: 'languages' },
    ],
    defaultLocale: 'en',
  },
  title: tk('site.title'),
  nav: [
    { label: tk('nav.home'), icon: 'home', page: '../README.md' },
    {
      label: tk('nav.guide'),
      icon: 'book',
      page: './pages/guide.md',
    },
  ],
})
```

Key resolution falls back through the active locale's primary subtag → `defaultLocale` → `en` → the
id itself, and `{name}` placeholders are interpolated. `tk()` and inline `{ en, zh }` maps can be
mixed freely — use `tk()` for shared/centrally managed text and an inline map for one-off strings.

**Auto-discovery details & overrides**

- The convention is `locales/<code>.json` (e.g. `locales/en.json`, `locales/zh.json`), resolved
  relative to the config directory. `code` is the file name (a `LocaleCode` like `en` or `zh-TW`).
- An explicit `i18n.messages` is still supported and **overrides** auto-loaded keys (per id); an
  explicit `i18n.locales` controls the label/icon/order. Both are optional.
- Auto-discovery is a **CLI** feature. If you embed the library yourself (calling `createSiteApp`
  without the `vue-site` CLI), pass `i18n.messages` directly — e.g. build it from JSON with explicit
  imports (avoid `import.meta.glob` inside `site.config.ts`, which the CLI pre-loads in Node).

### Localizing in your own pages

`useLocalize()` returns `t(id, params?)` (resolve a message id from the central catalog with
`{name}` interpolation), `localize(value)` (resolve any `LocalizedString` — a `tk()` ref, an inline
map, or a plain string), and the reactive `locale` ref. `useLocale()` returns
`{ locale, setLocale, locales }` for building a custom switcher. All work inside any component
rendered by `createSiteApp`.

```vue
<script setup lang="ts">
import { useLocalize } from '@bndynet/vue-site'

const { t, localize, locale } = useLocalize()
</script>

<template>
  <!-- key from the central message file -->
  <h1>{{ t('nav.home') }}</h1>
  <!-- or inline, for one-off text -->
  <p>{{ localize({ en: 'Hello', zh: '你好' }) }} — {{ locale }}</p>
</template>
```

## Per-page authorization (`auth`)

Gate individual pages on the current user. Add an `auth` rule to any `NavItem` or `StandalonePage`, and a single `auth.authorize` policy in `SiteConfig` to decide access.

```typescript
import { defineConfig } from '@bndynet/vue-site'

export default defineConfig({
  title: 'My Site',
  auth: {
    loginPath: '/login',
    authorize: ({ rule }) => {
      const user = getCurrentUser() // your own auth state
      if (!user) return '/login' // not signed in -> redirect (string)
      if (rule === true) return true // `auth: true` -> any signed-in user
      if (typeof rule === 'string') return user.roles.includes(rule)
      if (Array.isArray(rule)) return rule.some((r) => user.roles.includes(r))
      return true
    },
  },
  nav: [
    { label: 'Home', icon: 'home', page: () => import('../README.md?raw') },
    { label: 'Dashboard', icon: 'gauge', auth: true, page: () => import('./pages/Dash.vue') },
    { label: 'Admin', icon: 'shield', auth: ['admin'], page: () => import('./pages/Admin.vue') },
  ],
  pages: [
    { path: '/login', page: () => import('./pages/Login.vue') }, // no `auth` -> always reachable
  ],
})
```

### How it works

- `authorize` runs **on every navigation** (a Vue Router `beforeEach` guard). It receives `{ rule, item, to, from }` and returns `true` (allow), `false` (deny), or a path `string` (redirect, e.g. to a login page).
- On `false`, the user is sent to `auth.loginPath` with the requested path as a `redirect` query (`/login?redirect=/admin`); if `loginPath` is unset, the navigation is cancelled.
- `authorize` also runs **once at startup** (with only `rule` / `item`) to hide unauthorized items from the nav menu. Like `visible`, this menu filtering is not reactive — it reflects the state at app creation, so update it by recreating the app (e.g. a full reload after login).
- Guarded routes stay **registered**, so visiting a protected URL directly triggers the guard (and your login redirect) rather than silently 404-ing.
- The login page itself must **not** carry an `auth` rule (and `loginPath` is always allowed by the guard) to avoid redirect loops.

### `AuthConfig`

| Property | Description |
|----------|-------------|
| `authorize` | `(ctx: AuthContext) => boolean \| string \| Promise<boolean \| string>`. `true` allows, `false` denies, a `string` redirects. |
| `loginPath` | Where to send denied users (with `?redirect=`). Optional; without it, denials cancel navigation. |

`AuthRule` is `boolean \| string \| string[] \| ((ctx: AuthContext) => boolean \| Promise<boolean>)`. The framework never inspects the rule; it forwards it to `authorize`, so its meaning is entirely up to you.

### `visible` vs `auth`

| | `visible` | `auth` |
|--|-----------|--------|
| Decides | Whether the item/route **exists** | Whether the **current user** may enter |
| When | Build/startup (once) | Navigation (every time) + startup for menu filtering |
| Route registered | No (unreachable by URL) | Yes (guarded; can redirect to login) |
| Reacts to login/logout | No | Guard yes; menu filtering no |
| Best for | Env / feature-flag / static trimming | Login state, roles, login redirects |

Use `visible` for static existence trimming and `auth` for user-based access. They can be combined on the same item.

## Router history (`router`)

By default routes use **hash** history (`#/path`), which works on any static host with no server configuration and is independent of the public base. To get clean URLs, switch to HTML5 history:

```typescript
export default defineConfig({
  title: 'My Site',
  router: { mode: 'web' }, // /app/admin instead of /app/#/admin
  nav: [/* ... */],
})
```

### `RouterConfig`

| Property | Default | Description |
|----------|---------|-------------|
| `mode` | `hash` | `hash` (`#/path`, no server config) or `web` (HTML5 clean URLs) |
| `base` | `import.meta.env.BASE_URL` | Base path for `web` mode. The CLI sets this from `--base` / `env.vite.base` automatically; override only when calling `createSiteApp` from a custom entry. |

Notes:

- **`web` mode requires SPA fallback**: configure your host to serve `index.html` for unknown paths, otherwise deep links / refreshes 404. Hash mode needs nothing.
- **Subpath deploys**: with the CLI, `--base=/app/` is picked up automatically as the history base in `web` mode. In [library mode](#library-mode), pass `router: { mode: 'web', base: import.meta.env.BASE_URL }` from your own entry.

## `env` (`SiteEnvConfig`)

| Property | Description |
|----------|-------------|
| `port` | Dev server port |
| `outDir` | Build output (relative to site root; default `{folder}-dist`) |
| `customElements` | Tag prefixes for custom elements (e.g. `['chat-', 'i-']`) |
| `watchPackages` | Local packages — see [env.watchPackages](#envwatchpackages) |
| `vite` | Vite overrides (not `root`); framework merges aliases, `server.fs.allow`, `build.outDir`, etc. |

### `env.watchPackages`

- **String** — package name only (e.g. workspace symlink / `npm link`). Dependency pre-bundling is skipped; file watching follows Vite defaults.
- **`{ name, entryPath }`** — `name` must match the import specifier (e.g. `@scope/pkg`). `entryPath` is **relative to the directory where you run the CLI** (the folder that contains `site.config.*`). Vite resolves that package to your **source entry** for dev HMR and adds the package directory to `server.fs.allow`.
- If you use **`env.vite.resolve.alias` as an array** (`{ find, replacement }[]`), the CLI still merges `watchPackages` aliases correctly (object-only spread would break this).
- **Do not** add a **top-level value import** of the same package in `site.config.ts` if it is listed here — the config preload runs in Node and would resolve `node_modules`, while the app uses Vite. Use **`configureApp` + dynamic `import()`** instead (see next section).

### Local packages in `configureApp`

`configureApp` may be **`async`** so you can `await import('your-package')` after the router is installed. That dynamic import runs in the browser under Vite, so it respects `watchPackages` and does not run during CLI config loading.

```typescript
export default defineConfig({
  env: {
    watchPackages: [{ name: '@acme/widgets', entryPath: '../widgets/src/index.ts' }],
  },
  async configureApp(app) {
    const w = await import('@acme/widgets')
    w.register(app)
  },
})
```

### Dev server filesystem access

The CLI allows `server.fs` reads under the site root, the installed `vue-site` package directory, the **parent** of the site root (for `../…` imports), and — when it would not widen to the filesystem root — the **grandparent** (common in monorepos, e.g. `../../packages/...`). Add more paths with `env.vite.server.fs.allow` if needed. Entries from `watchPackages` with `{ entryPath }` also extend `fs.allow` for those package trees.

## Library mode

Own `index.html` + Vite setup:

```typescript
import { createSiteApp } from '@bndynet/vue-site'
import '@bndynet/vue-site/style.css'
import config from './site.config'

const app = await createSiteApp(config)
app.mount('#app')
```

Use a top-level `await` in your entry (or an async IIFE): `createSiteApp` is async and **awaits** `configureApp` when it returns a `Promise`. If you set optional `bootstrap` in config, that module loads before the app is created; if you omit `bootstrap`, that step is skipped.

Exports: `createSiteApp`, `defineConfig`, `useTheme`, `useSiteConfig`, `useLocale`, `useLocalize`, `tk`, `resolveLocalized`, `resolveField`, `resolveMessage`, `mergeCatalog`, `flattenMessages`, `isMessageRef`, `localizedPage`, `builtinMessages`, `themeRefKey`, `localeRefKey`. Types: `SiteConfig`, `SiteEnvConfig`, `SiteViteConfig`, `SiteExternalLink`, `ShellConfig`, `ShellAction`, `ShellActionLoader`, `NavItem`, `StandalonePage`, `PageLayout`, `AuthRule`, `AuthContext`, `AuthConfig`, `RouterConfig`, `ThemeConfig`, `ThemeOption`, `ThemePaletteVars`, `ResolvedNavItem`, `I18nConfig`, `LocaleOption`, `LocaleCode`, `LocalizedString`, `MessageRef`, `MessageTree`, `MessageCatalog`, `PageLoader`, `LocalizedPageOptions`.

### Theme in Vue pages (`useTheme`)

Import `useTheme` from `@bndynet/vue-site`. It returns a reactive `theme` ref (the active theme id, e.g. `light`, `dark`, or an `extraThemes[].id`) plus `setTheme` and `toggleTheme`. The root layout also sets `document.documentElement` attribute `data-theme` and applies CSS variables, so you can style with `var(--color-*)` without JavaScript.

The theme ref is **provided** by `createSiteApp()` (same Vue runtime as your app), so `watch(theme, …)` works reliably even when another tool would otherwise load a second copy of `vue` from nested `node_modules`.

```vue
<script setup lang="ts">
import { watch } from 'vue'
import { useTheme } from '@bndynet/vue-site'

const { theme, setTheme, toggleTheme } = useTheme()

watch(theme, (next, prev) => {
  if (prev !== undefined) console.log('theme:', prev, '→', next)
})
</script>

<template>
  <p>Current theme: {{ theme }}</p>
</template>
```

`watch` only runs when the theme **changes** after your component is set up (for example after the user clicks the theme control). It does not run on the initial value unless you pass `{ immediate: true }`.

## Upgrade

```bash
npm update @bndynet/vue-site
```

## Developing this repo

```bash
git clone https://github.com/bndynet/vue-site.git && cd vue-site
npm install
npm run dev    # watch-build lib + example site
npm run build  # `dist/` + `example/example-dist`
```

### Using a local build in another project

The published entry points at `dist/`. After changing library **source** under `src/`, run `npm run build:lib` (or `build:lib:watch`) before the consumer sees updates. Changes to **`bin/vue-site.mjs`** apply on the next `vue-site` run without a lib rebuild.

```bash
cd /path/to/vue-site
npm install && npm run build:lib
npm link

cd /path/to/consumer
npm link @bndynet/vue-site
```

You do not need to run `npm link` again after editing files; the symlink stays. Use `npm unlink @bndynet/vue-site` and `npm install` in the consumer when done.

## License

MIT
