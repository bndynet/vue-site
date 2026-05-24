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
  theme: {
    default: 'light',
    extraThemes: [
      {
        id: 'sepia',
        label: 'Sepia',
        icon: 'coffee',
        basedOn: 'light',
        palette: {
          '--color-bg': '#f4ecd8',
          '--color-text': '#433d32',
          '--color-text-secondary': '#6b6458',
          '--color-link': '#a67c52',
          '--color-link-hover': '#8b6239',
          '--color-sidebar-bg': '#ebe4d6',
          '--color-sidebar-text': '#4a443b',
          '--color-sidebar-title': '#a67c52',
          '--color-sidebar-item-hover': '#ddd4c4',
          '--color-sidebar-item-active': '#e8dfd0',
          '--color-sidebar-item-active-text': '#8b6239',
          '--color-sidebar-border': '#d4cbb8',
          '--color-content-bg': '#f4ecd8',
          '--color-border': '#d4cbb8',
          '--color-scrollbar': '#c4b8a4',
          '--color-code-bg': '#ebe4d6',
          '--color-code-text': '#433d32',
          '--color-code-block-bg': '#ebe4d6',
          '--color-code-border': '#d4cbb8',
          '--color-table-header-bg': '#ebe4d6',
          '--color-table-border': '#d4cbb8',
          '--color-table-row-hover': '#ebe4d6',
          '--color-blockquote-border': '#a67c52',
          '--color-blockquote-bg': '#ebe4d6',
          '--color-blockquote-text': '#4a443b',
          '--color-theme-switch-bg': '#ddd4c4',
          '--color-theme-switch-text': '#4a443b',
          '--color-theme-switch-hover': '#d4cbb8',
        },
      },
      {
        id: 'ocean',
        label: 'Ocean',
        icon: 'waves',
        basedOn: 'dark',
        palette: {
          '--color-bg': '#0c1929',
          '--color-text': '#e0f2fe',
          '--color-text-secondary': '#7dd3fc',
          '--color-link': '#22d3ee',
          '--color-link-hover': '#67e8f9',
          '--color-sidebar-bg': '#0f2942',
          '--color-sidebar-text': '#bae6fd',
          '--color-sidebar-title': '#22d3ee',
          '--color-sidebar-item-hover': '#164e63',
          '--color-sidebar-item-active': '#155e75',
          '--color-sidebar-item-active-text': '#a5f3fc',
          '--color-sidebar-border': '#164e63',
          '--color-content-bg': '#0c1929',
          '--color-border': '#164e63',
          '--color-scrollbar': '#0e7490',
          '--color-code-bg': '#0f2942',
          '--color-code-text': '#e0f2fe',
          '--color-code-block-bg': '#0f2942',
          '--color-code-border': '#164e63',
          '--color-table-header-bg': '#0f2942',
          '--color-table-border': '#164e63',
          '--color-table-row-hover': '#0f2942',
          '--color-blockquote-border': '#22d3ee',
          '--color-blockquote-bg': '#0f2942',
          '--color-blockquote-text': '#bae6fd',
          '--color-theme-switch-bg': '#164e63',
          '--color-theme-switch-text': '#e0f2fe',
          '--color-theme-switch-hover': '#155e75',
        },
      },
    ],
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
