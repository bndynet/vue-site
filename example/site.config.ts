import type { App } from 'vue'
import { defineConfig } from '@bndynet/vue-site'

export default defineConfig({
  title: 'My Site',
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
  footer: 'Copyright © 2026 BNDY.NET',
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
    { label: 'Home', icon: 'home', page: () => import('../README.md?raw') },
    {
      label: 'Docs',
      icon: 'book-open',
      children: [
        {
          label: 'Guide',
          icon: 'book',
          children: [
            {
              label: 'Getting Started',
              icon: 'rocket',
              page: () => import('./pages/GettingStarted.md?raw'),
            },
            {
              label: 'Configuration',
              icon: 'settings',
              page: () => import('./pages/Configuration.md?raw'),
            },
          ],
        },
        {
          label: 'API',
          icon: 'brackets',
          children: [
            {
              label: 'Overview',
              icon: 'file-text',
            },
            {
              label: 'Errors',
              icon: 'circle-alert',
            },
          ],
        },
        {
          label: 'Cookbook',
          icon: 'chef-hat',
        },
        {
          label: 'FAQ',
          icon: 'circle-help',
        },
      ],
    },
    { label: 'Element Plus', icon: 'component', page: () => import('./pages/ElementPlusDemo.vue') },
    { label: 'About', icon: 'info', page: () => import('./pages/AboutView.vue') },
    // A nav entry that links to the standalone `/landing` page (no own route registered).
    { label: 'Landing', icon: 'rocket', link: '/landing' },
    // `auth: true` requires any logged-in user (the `authorize` policy above sends guests to
    // `/login`). Unlike `visible`, the route stays registered and the guard runs on every
    // navigation, so visiting `#/dashboard` directly while logged out redirects to the login page.
    {
      label: 'Auth Page',
      icon: 'gauge',
      auth: true,
      page: () => import('./pages/AuthPageView.vue'),
    },
    // `auth: ['admin']` requires the `admin` role. The item is also hidden from the menu at
    // startup when the current user is not authorized (try logging in via `#/login`).
    {
      label: 'Admin',
      icon: 'shield',
      auth: ['admin'],
      page: () => import('./pages/AdminView.vue'),
    },
    {
      label: 'Login',
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
