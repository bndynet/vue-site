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
| `watchPackages` | Local packages: package name string, or `{ name, entryPath }` for source HMR |
| `vite` | Vite overrides (not `root`); framework merges aliases, `server.fs.allow`, `build.outDir`, etc. |

## Library mode

Own `index.html` + Vite setup:

```typescript
import { createSiteApp } from '@bndynet/vue-site'
import '@bndynet/vue-site/style.css'
import config from './site.config'

createSiteApp(config).mount('#app')
```

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

## License

MIT
