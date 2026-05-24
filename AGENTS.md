# AGENTS.md

Guidance for AI coding agents (and humans) working in this repository. Read this
before making changes. Keep edits consistent with the conventions below.

## What this project is

`@bndynet/vue-site` is a **configuration-driven Vue 3 site framework**, published to
npm as a **library + CLI**. A consumer writes a single `site.config.ts` plus Markdown /
Vue pages — no hand-written `main.ts`, `index.html`, or `vite.config.ts`. The framework
provides sidebar navigation, Markdown rendering, syntax highlighting, light/dark/custom
themes, per-page authorization, and hash/HTML5 routing.

There are two public entry points:

- **Library** (`src/index.ts`) → bundled to `dist/index.es.js` (ESM only). Used via
  `createSiteApp(config)` / `defineConfig(config)`.
- **CLI** (`bin/vue-site.mjs`) → the `vue-site` / `vs` commands (`dev`, `build`,
  `preview`). Plain Node ESM that drives Vite programmatically.

## Repository layout

```
src/
  index.ts            Public API surface (exports + defineConfig). Keep exports curated.
  create-app.ts       createSiteApp(): wires nav, router, auth, theme, mounts AppLayout.
  router.ts           Nav resolution + Vue Router construction (visible filtering, routes).
  auth.ts             Auth navigation guard + startup menu pruning.
  nav-utils.ts        Pure helpers for nav trees (depth, active item, external links).
  types.ts            All public types. Single source of truth; heavily JSDoc-documented.
  components/         Vue SFCs (AppLayout, PageView, SideNav, ThemeSwitch, ...).
  composables/        useTheme, useSiteConfig, useNavLayout (provide/inject + InjectionKey).
  theme/              Palette presets + resolution.
  styles/             Plain CSS, CSS-variable driven (base, layout, markdown, code, EP theme).
bin/vue-site.mjs      CLI (Node ESM). Loads site.config.*, runs Vite dev/build/preview.
example/              Reference consumer site (site.config.ts + pages/). Use to verify changes.
dist/                 Build output. Generated — never edit by hand.
```

## Tech stack & constraints

- **Vue 3** (`<script setup lang="ts">` SFCs), **Vue Router 4**, **Element Plus**.
- **Vite 6** library build (`vite.config.ts`), ESM-only output (`formats: ['es']`).
- **TypeScript ~5.7**, `strict: true`, `moduleResolution: "bundler"`, `noEmit` (Vite/dts emit).
- `vue`, `vue-router`, `element-plus` are **externalized** in the lib build — they are peer
  runtime deps provided by the consumer. Do not bundle them; do not rely on a second copy.
- **No test runner and no linter are configured** (`test` / `lint` scripts are no-ops).
  Don't assume `npm test` validates anything; verify via type-check + the example site.
- **`highlight.js`, `markdown-it`, `lucide-vue-next`** power rendering/icons.

## Code style (match existing files exactly)

- **No semicolons**, **single quotes**, **2-space indentation**, **trailing commas** in
  multiline literals. (There is no Prettier/ESLint config — consistency is by convention,
  so mirror the surrounding file.)
- Prefer **named exports**; the public API is re-exported explicitly from `src/index.ts`.
- Use the **`@/*` path alias** for `src/*` only where existing files do; relative imports
  (`./`, `../`) are common within `src/` — match the neighboring files.
- **JSDoc** every public type, config field, and exported function, in the same descriptive
  style as `types.ts`. These comments are the documentation consumers see in their IDE.
- Use `import type { ... }` for type-only imports (the codebase does this consistently).
- Keep helper functions **pure** where possible (see `nav-utils.ts`, `router.ts`); push
  side effects (DOM, localStorage) to clearly scoped functions (see `composables/useTheme.ts`).

### Vue components

- Always `<script setup lang="ts">`. Type props with `defineProps<{ ... }>()`.
- `<style scoped>` per component; **style with CSS variables** (`var(--color-*)`) so themes
  work — never hardcode theme colors.
- Use `shallowRef` for component/module values (see `PageView.vue`).

### Composables / dependency injection

- Cross-component state uses **`provide`/`inject` with a typed `InjectionKey`**
  (`useSiteConfig.ts`, `useTheme.ts`). `createSiteApp` provides; composables inject and
  **throw a clear `[vue-site] ...` error** if used outside an app created by `createSiteApp`.
- For keys that must survive duplicate package copies, use `Symbol.for(...)` (see
  `themeRefKey`). Follow the existing pattern rather than inventing a new mechanism.

## Behavioral rules that must be preserved

These encode subtle, intentional behavior — don't regress them:

- **`visible` vs `auth`**: `visible` is a build/startup existence switch (no route
  registered when hidden). `auth` keeps the route **registered** and enforces it via a
  Router `beforeEach` guard so direct URLs can redirect to login. Both menu-filtering passes
  run **once at startup** and are **not reactive** to later login/logout.
- **Routes stay registered for guarded pages**; only the *menu* is filtered (see
  `pruneNavByAuth` vs `collectRoutes`). Never make guarded routes unreachable.
- **Login page must never carry `auth`**, and `auth.loginPath` is always allowed by the
  guard (prevents redirect loops).
- **`defaultPath`** must match a registered route; otherwise fall back to the first nav item
  and `console.warn` in dev only (`import.meta.env.DEV`). Don't introduce redirect loops.
- **Router history**: `hash` is the default and base-agnostic; `web` needs the public base
  (`config.router.base ?? config.baseUrl`) and SPA fallback on the host.
- **Theme**: `data-theme` attribute + `html.dark` class (for Element Plus) + CSS variables.
  Persisted in `localStorage` under `vue-site-theme`; localStorage access is wrapped in
  try/catch. Keep that resilience.

## Public API changes

- The export list in `src/index.ts` and the type exports in `types.ts` are the **contract**.
  Adding/removing/renaming an export is a **breaking or feature change** — update the README
  config reference tables and the `example/` usage to match, and bump the version
  appropriately (semver; package is at `1.x`).
- When you add a config field, add it to the right interface in `types.ts` **with JSDoc**,
  thread it through `create-app.ts` / `router.ts` / `auth.ts` as needed, demonstrate it in
  `example/site.config.ts`, and document it in `README.md`.

## Build, run, verify

```bash
npm install
npm run dev          # watch-build lib + run the example site (HMR)
npm run build:lib    # build dist/ (run after changing src/ before consumers see updates)
npm run build        # dist/ + example/example-dist
npm run preview      # full build + preview the example
```

Verification expectations for any change (no automated tests exist):

1. `npm run build:lib` succeeds (this also runs `vue-tsc`/dts — treat type errors as failures).
2. The **`example/` site** runs (`npm run dev`) and exercises the changed behavior.
3. For CLI changes (`bin/vue-site.mjs`): test `dev`, `build`, and `--base=/sub/` deploy.

## Security & safety conventions

- **Never hardcode secrets** (tokens, npm tokens, keys). Publishing uses
  `secrets.NPM_TOKEN` via GitHub Actions (`.github/workflows/main.yml`).
- The `auth` system is a **consumer-provided policy** (`authorize`) — the framework
  forwards an opaque `AuthRule` and never interprets it. Don't add framework-side trust
  decisions; keep authorization in the consumer's callback.
- When rendering Markdown / consumer content, keep the existing rendering pipeline; don't
  introduce raw HTML injection paths beyond what `markdown-it` / `MarkdownView` already do.

## Things NOT to do

- Don't edit `dist/` (generated) or `package-lock.json` by hand.
- Don't add `vue` / `vue-router` / `element-plus` to the bundle or remove them from
  `rollupOptions.external`.
- Don't add semicolons, switch quote style, or reformat unrelated code.
- Don't introduce a second copy of `vue` at runtime, or replace `Symbol.for` injection keys
  with plain `Symbol()` where dedupe matters.
- Don't create new top-level config files (Prettier/ESLint/test) unless explicitly asked.
