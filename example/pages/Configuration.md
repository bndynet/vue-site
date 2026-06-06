# Configuration

Use `defineConfig({ ... })` in `site.config.ts`. Full tables and `env` / `theme` details: root [README.md](https://github.com/bndynet/vue-site/blob/main/README.md).

**Common fields:** `title`, `nav` (`label`, `icon`, `page`, `children`, `link`, `visible`), `pages`, `logo`, `theme`, `footer`, `links`, `env` (`port`, `outDir`, `vite`, …).

**`nav[].page`** — the page content. Simplest is a **file-path string** like `'./pages/About.vue'` or `'./README.md'`: the framework loads it and, for multi-language sites, automatically uses the matching `name.<code>` sibling (e.g. `README.zh.md`), falling back to the base file. You can also pass a loader (`() => import('./About.vue')`) when you don't need this. See *Advanced page loaders* in the root README.

**`nav[].visible`** — optional `() => boolean | Promise<boolean>`, awaited once at startup. Return `false` to hide the item from navigation and skip registering its route (so it is not reachable by direct URL). Use it for permission-gated entries, e.g. `visible: () => localStorage.getItem('isAdmin') === '1'`. A hidden parent hides its whole subtree, and a group whose children all become hidden is pruned. It is evaluated only at startup, so it does not react to later permission changes (login/logout) without recreating the app.

**`pages`** — standalone, full-screen pages registered outside the `nav` tree. They do not appear in any navigation and render with no top bar, sidebar, or footer (content only); the active theme still applies via root CSS variables. Each entry is `{ path, page }`, e.g. `{ path: '/landing', page: './pages/Landing.vue' }` (`page` takes the same forms as `nav[].page`).
