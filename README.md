# @bndynet/vue-site

Configurable Vue 3 site framework: one package, `site.config.ts`, and Markdown pages — sidebar, syntax-highlighted code, light/dark themes. No hand-written `main.ts`, `index.html`, or `vite.config.ts`.

## Features

- Config-driven nav (Lucide icon names)
- Markdown (`?raw`) or Vue pages
- highlight.js, light/dark theme + localStorage
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
| `title` | Site title (sidebar + tab) |
| `nav` | `NavItem[]` |
| `logo` | Logo URL or imported image |
| `theme` | See `ThemeConfig` below |
| `footer` | Footer text |
| `readme` | Raw Home content if no `README.md` |
| `links` | Header links: Lucide `icon` + `link`, optional `title` |
| `packageRepository` | Usually set by CLI from `package.json`; omit when using `createSiteApp` alone |
| `env` | Dev/build options — see below |
| `bootstrap` | Optional path from site root (e.g. `./bootstrap.ts`) — module loaded once before the Vue app |
| `configureApp` | Optional `(app) => void \| Promise<void>` after router install, before `mount` (see [Local packages in `configureApp`](#local-packages-in-configureapp)) |

### `NavItem`

| Property | Description |
|----------|-------------|
| `label` | Sidebar text |
| `icon` | [Lucide](https://lucide.dev/icons) name |
| `page` | `() => import('./page.md?raw')` or `() => import('./Page.vue')` |
| `path` | Route path (derived from `label` if omitted) |
| `children` | Nested group |

### `ThemeConfig`

| Property | Default | Description |
|----------|---------|-------------|
| `default` | `light` | `light`, `dark`, or an `extraThemes[].id` |
| `colors` | — | Global CSS variable overrides |
| `palettes` | — | Partial overrides for built-in light/dark only |
| `extraThemes` | — | Extra themes: `id`, `label`, `icon`, optional `basedOn`, `palette`; import `builtinThemePalettes` for full defaults |

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

Exports: `createSiteApp`, `defineConfig`, `useTheme`, `useSiteConfig`, `themeRefKey`. Types: `SiteConfig`, `SiteEnvConfig`, `SiteViteConfig`, `SiteExternalLink`, `NavItem`, `ThemeConfig`, `ThemeOption`, `ThemePaletteVars`, `ResolvedNavItem`.

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
