import type { App } from 'vue'
import { defineConfig, localizedPage } from '@bndynet/vue-site'

export default defineConfig({
  // Multi-language support. Adds a locale switcher to the header and resolves any
  // `LocalizedString` field (title, nav labels, footer, ...) against the active locale.
  // The initial locale is: stored choice > browser language > `defaultLocale`.
  i18n: {
    locales: [
      { code: 'en', label: 'English' },
      { code: 'zh', label: '简体中文', icon: 'languages' },
    ],
    defaultLocale: 'en',
  },
  // A `LocalizedString`: per-locale text. A plain string still works for single-language sites.
  title: { en: 'My Site', zh: '我的站点' },
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
  footer: { en: 'Copyright © 2026 BNDY.NET', zh: '版权所有 © 2026 BNDY.NET' },
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
    { label: { en: 'Home', zh: '首页' }, icon: 'home', page: () => import('../README.md?raw') },
    {
      label: { en: 'Docs', zh: '文档' },
      icon: 'book-open',
      children: [
        {
          label: { en: 'Guide', zh: '指南' },
          icon: 'book',
          children: [
            {
              label: { en: 'Getting Started', zh: '快速开始' },
              icon: 'rocket',
              // Per-locale page content; falls back to the default locale when a language is missing.
              page: localizedPage({
                en: () => import('./pages/GettingStarted.md?raw'),
                zh: () => import('./pages/GettingStarted.zh.md?raw'),
              }),
            },
            {
              label: { en: 'Configuration', zh: '配置' },
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
              label: { en: 'Overview', zh: '概览' },
              icon: 'file-text',
            },
            {
              label: { en: 'Errors', zh: '错误' },
              icon: 'circle-alert',
            },
          ],
        },
        {
          label: { en: 'Cookbook', zh: '实践手册' },
          icon: 'chef-hat',
        },
        {
          label: { en: 'FAQ', zh: '常见问题' },
          icon: 'circle-help',
        },
      ],
    },
    { label: 'Element Plus', icon: 'component', page: () => import('./pages/ElementPlusDemo.vue') },
    { label: { en: 'About', zh: '关于' }, icon: 'info', page: () => import('./pages/AboutView.vue') },
    // A nav entry that links to the standalone `/landing` page (no own route registered).
    { label: { en: 'Landing', zh: '着陆页' }, icon: 'rocket', link: '/landing' },
    // `auth: true` requires any logged-in user (the `authorize` policy above sends guests to
    // `/login`). Unlike `visible`, the route stays registered and the guard runs on every
    // navigation, so visiting `#/dashboard` directly while logged out redirects to the login page.
    {
      label: { en: 'Auth Page', zh: '鉴权页' },
      icon: 'gauge',
      auth: true,
      page: () => import('./pages/AuthPageView.vue'),
    },
    // `auth: ['admin']` requires the `admin` role. The item is also hidden from the menu at
    // startup when the current user is not authorized (try logging in via `#/login`).
    {
      label: { en: 'Admin', zh: '管理' },
      icon: 'shield',
      auth: ['admin'],
      page: () => import('./pages/AdminView.vue'),
    },
    {
      label: { en: 'Login', zh: '登录' },
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
