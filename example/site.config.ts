import type { App } from 'vue'
import { defineConfig, localizedPage, tk } from '@bndynet/vue-site'

export default defineConfig({
  // Multi-language support. Translations are auto-loaded from `locales/<code>.json` (here
  // `locales/en.json` + `locales/zh.json`) — no `messages` field or glue code needed. Reference
  // any key with `tk('id')` in this config or `t('id')` in pages.
  // `i18n.locales` is optional too: omit it and the language list is derived from the file names
  // (with friendly built-in labels). It's declared here only to customize labels/icons/order.
  i18n: {
    locales: [
      { code: 'en', label: 'English' },
      { code: 'zh', label: '简体中文', icon: 'languages' },
    ],
    defaultLocale: 'en',
  },
  // `tk('site.title')` references a key from the auto-loaded catalog instead of inlining text.
  // (You can still pass a plain string or an inline `{ en, zh }` map if you prefer.)
  title: tk('site.title'),
  // Optional: remove this line to skip loading `bootstrap.ts`.
  bootstrap: './bootstrap.ts',
  // Page the site opens at (root `/` and unknown paths redirect here). Must match a registered
  // route (a `nav` item's resolved path or a `pages` entry's `path`). Defaults to the first
  // top-level `nav` item — here that is `Home` (`/`).
  // defaultPath: '/about',
  configureApp(app: App) {
    console.log(
      '[vue-site example] configureApp: ran after router install (before mount)',
      app,
    )
  },
  // Router history mode. Default is 'hash' (#/path, works on any static host). Switch to HTML5
  // clean URLs with `mode: 'web'`; the base defaults to the CLI `--base` value. HTML5 mode needs
  // the host to serve index.html for unknown paths (SPA fallback).
  // router: { mode: 'web' },
  logo: 'https://static.bndy.net/images/logo.png',
  footer: tk('site.footer'),
  links: [
    {
      icon: 'package',
      link: 'https://www.npmjs.com/package/@bndynet/vue-site',
      title: 'npm package',
    },
  ],
  // Central authorization policy. Pages opt in by adding an `auth` rule (see `nav` below).
  // This demo stores the current role in localStorage (set by the `/login` page). `authorize`
  // runs at navigation time (every navigation) and once at startup to filter the nav menu.
  auth: {
    loginPath: '/login',
    authorize: ({ rule }) => {
      const role = localStorage.getItem('role') // '' | 'user' | 'admin'
      if (!role) return '/login' // not logged in -> go to the login page
      if (rule === true) return true // `auth: true` -> any logged-in user
      if (typeof rule === 'string') return role === rule
      if (Array.isArray(rule)) return rule.includes(role)
      return true
    },
  },
  // Built-in themes are `light`, `dark`, plus the always-on extras `sepia` and `ocean`. Add more
  // via `extraThemes`, or set `theme: false` to disable theming (hides the switcher, forces a
  // fixed `light` palette, and skips localStorage persistence).
  theme: {
    default: 'light',
  },
  nav: [
    // Labels reference the central catalog via `tk('id')`. Brand names like `API` / `Element Plus`
    // stay plain strings since they read the same in every language.
    { label: tk('nav.home'), icon: 'home', page: () => import('../README.md?raw') },
    {
      label: tk('nav.docs'),
      icon: 'book-open',
      children: [
        {
          label: tk('nav.guide'),
          icon: 'book',
          children: [
            {
              label: tk('nav.gettingStarted'),
              icon: 'rocket',
              // Per-locale page content; falls back to the default locale when a language is missing.
              page: localizedPage({
                en: () => import('./pages/GettingStarted.md?raw'),
                zh: () => import('./pages/GettingStarted.zh.md?raw'),
              }),
            },
            {
              label: tk('nav.configuration'),
              icon: 'settings',
              page: localizedPage({
                en: () => import('./pages/Configuration.md?raw'),
                zh: () => import('./pages/Configuration.zh.md?raw'),
              }),
            },
          ],
        },
        {
          label: 'API',
          icon: 'brackets',
          children: [
            {
              label: tk('nav.overview'),
              icon: 'file-text',
            },
            {
              label: tk('nav.errors'),
              icon: 'circle-alert',
            },
          ],
        },
        {
          label: tk('nav.cookbook'),
          icon: 'chef-hat',
        },
        {
          label: tk('nav.faq'),
          icon: 'circle-help',
        },
      ],
    },
    { label: 'Element Plus', icon: 'component', page: () => import('./pages/ElementPlusDemo.vue') },
    { label: tk('nav.about'), icon: 'info', page: () => import('./pages/AboutView.vue') },
    // A nav entry that links to the standalone `/landing` page (no own route registered).
    { label: tk('nav.landing'), icon: 'rocket', link: '/landing' },
    // `auth: true` requires any logged-in user (the `authorize` policy above sends guests to
    // `/login`). Unlike `visible`, the route stays registered and the guard runs on every
    // navigation, so visiting `#/dashboard` directly while logged out redirects to the login page.
    {
      label: tk('nav.authPage'),
      icon: 'gauge',
      auth: true,
      page: () => import('./pages/AuthPageView.vue'),
    },
    // `auth: ['admin']` requires the `admin` role. The item is also hidden from the menu at
    // startup when the current user is not authorized (try logging in via `#/login`).
    {
      label: tk('nav.admin'),
      icon: 'shield',
      auth: ['admin'],
      page: () => import('./pages/AdminView.vue'),
    },
    {
      label: tk('nav.login'),
      icon: 'log-in',
      page: () => import('./pages/Login.vue'),
    }
  ],
  // Standalone, full-screen pages (no top bar / sidebar / footer). Open at `#/landing`.
  pages: [
    { path: '/landing', page: () => import('./pages/Landing.vue') },
    // Login page for the `auth` demo above. Left without an `auth` rule so it is always reachable.
    { path: '/login', page: () => import('./pages/Login.vue') },
  ],
  // env: {
  //   customElements: ['chat-', 'i-'],
  //   watchPackages: [
  //     '@bndynet/mono-package',
  //     { name: '@bndynet/my-lib', entryPath: '../my-lib/src/index.ts' },
  //   ],
  // },
})
