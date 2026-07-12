#!/usr/bin/env node

import { createServer, build, preview, mergeConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { resolve, dirname, basename } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import { createRequire } from 'module'
import { build as esbuild } from 'esbuild'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const pkgDir = resolve(__dirname, '..')
const FRAMEWORK_PACKAGE = '@bndynet/vue-site'
const frameworkEntry = resolve(pkgDir, 'dist/index.es.js')
const frameworkStyle = resolve(pkgDir, 'dist/style.css')

function resolvePkgDir(pkg, from = import.meta.url) {
  return dirname(createRequire(from).resolve(`${pkg}/package.json`))
}

function toVitePath(file) {
  return file.replace(/\\/g, '/')
}

const vuePath = resolvePkgDir('vue')
const vueRouterPath = resolvePkgDir('vue-router')
const lucidePath = resolvePkgDir('lucide-vue-next')
const elementPlusPath = resolvePkgDir('element-plus')
const elementPlusPackage = resolve(elementPlusPath, 'package.json')
const elementPlusIconsPath = resolvePkgDir('@element-plus/icons-vue', elementPlusPackage)
const dayjsPath = resolvePkgDir('dayjs', elementPlusPackage)
const lucideAliasPath = toVitePath(lucidePath)
const elementPlusAliasPath = toVitePath(elementPlusPath)
const elementPlusIconsAliasPath = toVitePath(elementPlusIconsPath)
const dayjsAliasPath = toVitePath(dayjsPath)
const cwd = process.cwd()
/** Lets `import('../file.md?raw')` work when `site.config` lives in a subfolder (README next to cwd). In-repo, ../ often falls under pkgDir; from npm install it does not, so we allow cwd's parent explicitly. */
const cwdParent = resolve(cwd, '..')
/** Two levels up: monorepos (`apps/docs` importing `../../packages/...`). Omitted when that would be the FS root (too permissive for dev). */
const cwdGrandparent = resolve(cwd, '../..')

/**
 * @param {string[]} argv
 * @returns {{ command: string, cliBase?: string, cliConfig?: string }}
 */
function parseCliArgv(argv = process.argv) {
  const sub = argv[2]
  const command =
    sub && !sub.startsWith('-')
      ? sub
      : 'dev'

  let cliBase
  let cliConfig
  const flagStart = command === sub && sub ? 3 : 2
  for (let i = flagStart; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--base') {
      const v = argv[i + 1]
      if (!v || v.startsWith('-')) {
        console.error(
          '[vue-site] --base requires a value (e.g. --base=/app/ or --base /app/)',
        )
        process.exit(1)
      }
      cliBase = v
      i++
    } else if (a.startsWith('--base=')) {
      const v = a.slice('--base='.length)
      if (!v) {
        console.error(
          '[vue-site] --base= requires a value (e.g. --base=/app/)',
        )
        process.exit(1)
      }
      cliBase = v
    } else if (a === '--config' || a === '-c') {
      const v = argv[i + 1]
      if (!v || v.startsWith('-')) {
        console.error(
          '[vue-site] --config requires a value (e.g. --config site.config.prod.ts)',
        )
        process.exit(1)
      }
      cliConfig = v
      i++
    } else if (a.startsWith('--config=')) {
      const v = a.slice('--config='.length)
      if (!v) {
        console.error(
          '[vue-site] --config= requires a value (e.g. --config=site.config.prod.ts)',
        )
        process.exit(1)
      }
      cliConfig = v
    }
  }
  return { command, cliBase, cliConfig }
}

function isLikelyFilesystemRoot(dir) {
  if (dir === '/' || dir === '//') return true
  if (process.platform === 'win32') {
    return /^[a-zA-Z]:[\\/]$/i.test(dir)
  }
  return false
}

const defaultServerFsAllow = [cwd, pkgDir, cwdParent]
if (
  cwdGrandparent !== cwdParent &&
  cwdGrandparent !== cwd &&
  !isLikelyFilesystemRoot(cwdGrandparent)
) {
  defaultServerFsAllow.push(cwdGrandparent)
}

const configCandidates = [
  'site.config.ts',
  'site.config.js',
  'site.config.mts',
  'site.config.mjs',
]

class CliConfigError extends Error {}

function resolveSiteConfig(cliConfig) {
  if (cliConfig) {
    const configPath = resolve(cwd, cliConfig)
    if (dirname(configPath) !== cwd) {
      throw new CliConfigError(
        `[vue-site] --config must name a file in the site root (${cwd}): ${cliConfig}`,
      )
    }
    if (!/\.(?:ts|js|mts|mjs)$/.test(configPath)) {
      throw new CliConfigError(
        `[vue-site] Unsupported config extension: ${cliConfig}. ` +
          'Use a .ts, .js, .mts, or .mjs file.',
      )
    }
    if (!fs.existsSync(configPath) || !fs.statSync(configPath).isFile()) {
      throw new CliConfigError(`[vue-site] Config file not found: ${configPath}`)
    }
    return basename(configPath)
  }

  const foundConfig = configCandidates.find((f) =>
    fs.existsSync(resolve(cwd, f)),
  )
  if (foundConfig) return foundConfig

  throw new CliConfigError(
    '\x1b[31mError: No site.config.ts found in the current directory.\x1b[0m\n\n' +
      'Create a site.config.ts file:\n\n' +
      '  import type { SiteConfig } from \'@bndynet/vue-site\'\n\n' +
      '  export default {\n' +
      '    title: \'My Site\',\n' +
      '    nav: [\n' +
      '      { label: \'Home\', icon: \'home\', page: () => import(\'./README.md?raw\') },\n' +
      '    ],\n' +
      '  } satisfies SiteConfig\n',
  )
}

const VIRTUAL_ENTRY = 'virtual:vue-site-entry'
const RESOLVED_ENTRY = '\0' + VIRTUAL_ENTRY
const VIRTUAL_PACKAGE = 'virtual:vue-site-package'
const RESOLVED_PACKAGE = '\0' + VIRTUAL_PACKAGE
const VIRTUAL_ICONS = 'virtual:vue-site-icons'
const RESOLVED_ICONS = '\0' + VIRTUAL_ICONS

function parseRepositoryUrl(pkg) {
  const r = pkg.repository
  if (!r) return null
  let url = typeof r === 'string' ? r : r.url
  if (!url) return null
  const ssh = /^git@([^:]+):(.+?)(\.git)?$/i.exec(url)
  if (ssh) {
    const host = ssh[1]
    const path = ssh[2]
    return `https://${host}/${path.replace(/\.git$/i, '')}`
  }
  url = url.replace(/^git\+/i, '')
  url = url.replace(/\.git$/i, '')
  if (/^github:/i.test(url)) {
    return 'https://github.com/' + url.replace(/^github:/i, '')
  }
  if (/^gist:/i.test(url)) {
    return 'https://gist.github.com/' + url.replace(/^gist:/i, '')
  }
  if (/^bitbucket:/i.test(url)) {
    return 'https://bitbucket.org/' + url.replace(/^bitbucket:/i, '')
  }
  if (/^gitlab:/i.test(url)) {
    return 'https://gitlab.com/' + url.replace(/^gitlab:/i, '')
  }
  if (url.startsWith('git:')) {
    url = 'https:' + url.slice(4)
  }
  return url || null
}

function tryReadRepositoryFromDir(dir) {
  try {
    const pkgPath = resolve(dir, 'package.json')
    if (!fs.existsSync(pkgPath)) return null
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
    return parseRepositoryUrl(pkg)
  } catch {
    return null
  }
}

/** Prefer parent directory's `repository`, then the site root (`cwd`) package.json. */
function readPackageRepositoryUrl() {
  const parentDir = resolve(cwd, '..')
  const fromParent = tryReadRepositoryFromDir(parentDir)
  if (fromParent) return fromParent
  return tryReadRepositoryFromDir(cwd)
}

/** Root-relative path for Vite (`./foo` -> `/foo`). */
function resolveBootstrapUrl(path) {
  const t = String(path).trim()
  if (!t) throw new Error('[vue-site] bootstrap path is empty')
  if (t.startsWith('/')) return t
  return '/' + t.replace(/^\.\//, '')
}

function escapeHtmlAttr(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
}

function getConfiguredFavicon(siteConfig) {
  const favicon = siteConfig?.favicon
  return typeof favicon === 'string' ? favicon.trim() : ''
}

function buildFaviconLink(siteConfig) {
  const favicon = getConfiguredFavicon(siteConfig)
  return favicon
    ? `  <link rel="icon" href="${escapeHtmlAttr(favicon)}" />\n`
    : ''
}

// Friendly display names for auto-discovered locale files (`/locales/<code>.json`). Used only when
// the config doesn't declare `i18n.locales`; unknown codes fall back to the code itself.
const LOCALE_LABELS = {
  en: 'English',
  zh: '简体中文',
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文',
  ja: '日本語',
  ko: '한국어',
  fr: 'Français',
  de: 'Deutsch',
  es: 'Español',
  pt: 'Português',
  ru: 'Русский',
  it: 'Italiano',
  nl: 'Nederlands',
  pl: 'Polski',
  tr: 'Türkçe',
  vi: 'Tiếng Việt',
  th: 'ไทย',
  ar: 'العربية',
}

/**
 * Bootstrap script shared by dev (virtual entry) and build (inlined in html).
 * `siteConfigSpecifier` differs because dev serves from Vite root (`/foo`)
 * while the build temp html lives next to the config (`./foo`).
 *
 * Static import bundles `bootstrap` for production; dynamic import with
 * vite-ignore is not emitted.
 *
 * Convention: translations are auto-loaded from `/locales/<code>.json` (relative to the Vite root,
 * i.e. the config's directory). The user writes zero glue code — no `index.ts`, no `messages` field.
 * An explicit `i18n.messages` still works and overrides auto-loaded keys; an explicit `i18n.locales`
 * still controls the label/icon/order, otherwise the locale list is derived from the file names.
 */
function buildBootstrapScript({ siteConfig, siteConfigSpecifier }) {
  const bs = siteConfig?.bootstrap
  const bootstrapImport =
    bs != null && String(bs).trim() !== ''
      ? `import '${resolveBootstrapUrl(bs)}'\n`
      : ''
  return [
    bootstrapImport,
    `import 'element-plus/theme-chalk/dark/css-vars.css'`,
    `import { createSiteApp } from '${FRAMEWORK_PACKAGE}'`,
    `import '${FRAMEWORK_PACKAGE}/style.css'`,
    `import siteConfig from '${siteConfigSpecifier}'`,
    `import { repositoryUrl } from '${VIRTUAL_PACKAGE}'`,
    `import { iconRegistry } from '${VIRTUAL_ICONS}'`,
    ``,
    `// Auto-discover translations: /locales/<code>.json -> { [code]: { ...messages } }.`,
    `const __localeFiles = import.meta.glob('/locales/*.json', { eager: true, import: 'default' })`,
    `const __LOCALE_LABELS = ${JSON.stringify(LOCALE_LABELS)}`,
    `const __autoMessages = {}`,
    `for (const __p in __localeFiles) {`,
    `  const __code = __p.slice(__p.lastIndexOf('/') + 1).replace(/\\.json$/, '')`,
    `  __autoMessages[__code] = __localeFiles[__p]`,
    `}`,
    `const __autoCodes = Object.keys(__autoMessages).sort()`,
    `function __deepMerge(base, override) {`,
    `  const out = { ...base }`,
    `  for (const k in (override || {})) {`,
    `    const a = out[k], b = override[k]`,
    `    out[k] = a && b && typeof a === 'object' && typeof b === 'object' && !Array.isArray(a) && !Array.isArray(b)`,
    `      ? __deepMerge(a, b) : b`,
    `  }`,
    `  return out`,
    `}`,
    `function __mergeMessages(base, override) {`,
    `  const out = {}`,
    `  const keys = new Set([...Object.keys(base), ...Object.keys(override || {})])`,
    `  for (const k of keys) out[k] = __deepMerge(base[k] || {}, (override || {})[k] || {})`,
    `  return out`,
    `}`,
    `// Merge auto-loaded files into i18n. Explicit config wins: messages override per key, and an`,
    `// explicit locales list controls label/icon/order (else it's derived from the file names).`,
    `function __resolveI18n(cfg) {`,
    `  const hasAuto = __autoCodes.length > 0`,
    `  if (!cfg && !hasAuto) return cfg`,
    `  const base = cfg || {}`,
    `  let locales = base.locales`,
    `  if ((!locales || !locales.length) && hasAuto) {`,
    `    locales = __autoCodes.map((c) => ({ code: c, label: __LOCALE_LABELS[c] || c }))`,
    `  }`,
    `  return { ...base, locales, messages: __mergeMessages(__autoMessages, base.messages) }`,
    `}`,
    `;(async () => {`,
    `  const searchParams = new URLSearchParams(window.location.search)`,
    `  const hasThemeQuery = searchParams.has('theme')`,
    `  const queryTheme = searchParams.get('theme') || ''`,
    `  const resolvedTheme = String(queryTheme).toLowerCase().includes('dark') ? 'dark' : 'light'`,
    `  if (hasThemeQuery) {`,
    `    try {`,
    `      localStorage.setItem('vue-site-theme', resolvedTheme)`,
    `    } catch {`,
    `      // localStorage may be unavailable`,
    `    }`,
    `  }`,
    `  const app = await createSiteApp({`,
    `    ...siteConfig,`,
    `    i18n: __resolveI18n(siteConfig.i18n),`,
    `    ...(hasThemeQuery ? { theme: { ...(siteConfig.theme || {}), default: resolvedTheme } } : {}),`,
    `    packageRepository: repositoryUrl,`,
    `    baseUrl: import.meta.env.BASE_URL,`,
    `    icons: { ...iconRegistry, ...(siteConfig.icons || {}) },`,
    `  })`,
    `  app.mount('#app')`,
    `})()`,
  ].join('\n')
}

function buildEntryCode(siteConfig, configFile) {
  return buildBootstrapScript({
    siteConfig,
    siteConfigSpecifier: `/${configFile}`,
  })
}

function buildHtmlShell(scriptTag, siteConfig) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
${buildFaviconLink(siteConfig)}  <title></title>
</head>
<body>
  <div id="app"></div>
  ${scriptTag}
</body>
</html>`
}

// esbuild plugin stubbing asset / SFC / `?raw` imports (static or dynamic) to an empty default
// export, so bundling the config for pre-load doesn't choke on resources Node can't load. Page
// loaders are never invoked during pre-load (only build-time settings are read).
function preloadAssetStubPlugin() {
  const NS = 'vue-site-asset'
  const ASSET =
    /\?raw(?:&\S*)?$|\.(?:vue|css|scss|sass|less|styl|md|markdown|png|jpe?g|gif|svg|webp|avif|ico)(?:\?\S*)?$/
  return {
    name: 'vue-site:preload-asset-stub',
    setup(b) {
      b.onResolve({ filter: ASSET }, (args) => ({ path: args.path, namespace: NS }))
      b.onLoad({ filter: /.*/, namespace: NS }, () => ({
        contents: 'export default ""',
        loader: 'js',
      }))
    },
  }
}

async function loadSiteConfig(configFile) {
  const configPath = resolve(cwd, configFile)
  const raw = fs.readFileSync(configPath, 'utf-8')

  // Stub the framework's value imports so the config evaluates without the real (browser-only)
  // package. `defineConfig` is identity (the config object passes through); every other named
  // import (e.g. `tk`, `localizedPage`) becomes a callable no-op that returns a no-op, covering
  // helpers used as values. Relative imports (e.g. `./locales`) are left intact and bundled below.
  let stubbed = raw.replace(
    /import\s*\{([^}]*)\}\s*from\s*['"][^'"]*vue-site['"]\s*;?/g,
    (_match, names) => {
      const ids = names
        .split(',')
        .map((part) => part.trim())
        .filter(Boolean)
        .map((part) => {
          const segments = part.split(/\s+as\s+/)
          return (segments[1] ?? segments[0]).trim()
        })
        .filter(Boolean)
      return ids
        .map((id) =>
          id === 'defineConfig'
            ? 'const defineConfig = (c) => c;'
            : `const ${id} = (..._args) => (() => {});`,
        )
        .join('\n')
    },
  )

  // `import.meta.glob(...)` is a Vite-only feature; in Node it would throw at config-eval time.
  // Stub it to an empty map so configs using `localizedPageGlob(import.meta.glob(...))` pre-load
  // (page loaders are never invoked here — only build-time settings are read). The real glob runs
  // in the browser via Vite.
  if (/import\.meta\.glob/.test(stubbed)) {
    stubbed =
      'const __vueSiteGlobStub = (..._args) => ({});\n' +
      stubbed.replace(/import\.meta\.glob/g, '__vueSiteGlobStub')
  }

  const isTs = /\.m?ts$/.test(configFile)
  // Write the stubbed entry next to the original so its relative imports (`./locales`) resolve.
  const entryFile = resolve(
    dirname(configPath),
    `.${basename(configPath)}.${Date.now()}.preload.${isTs ? 'ts' : 'js'}`,
  )
  const tmpDir = resolve(cwd, `.vue-site-preload-${Date.now()}`)
  fs.writeFileSync(entryFile, stubbed)

  try {
    // Bundle so local modules the config imports (e.g. `./locales.ts`) are inlined and TS is
    // handled; asset imports are stubbed; remaining bare deps stay external for Node to resolve.
    await esbuild({
      entryPoints: { 'site-config': entryFile },
      outdir: tmpDir,
      bundle: true,
      format: 'esm',
      platform: 'node',
      splitting: true,
      logLevel: 'silent',
      packages: 'external',
      outExtension: { '.js': '.mjs' },
      plugins: [preloadAssetStubPlugin()],
    })

    const entry = resolve(tmpDir, 'site-config.mjs')
    const mod = await import(pathToFileURL(entry).href)
    return mod.default || {}
  } catch (e) {
    throw new Error(
      `[vue-site] Could not pre-load site config from ${configFile}: ${e.message}\n` +
        `  This usually means your config imports modules Node can't resolve directly ` +
        `(path aliases like @/..., or framework APIs other than defineConfig).`,
    )
  } finally {
    try {
      fs.unlinkSync(entryFile)
    } catch {}
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true })
    } catch {}
  }
}

/**
 * Turn a base file path into a `import.meta.glob(...)` expression matching the base file plus its
 * per-locale siblings (`name.<code>.ext`) — but NOT unrelated `nameOther.ext`:
 *   `../README.md`     -> import.meta.glob(["../README.md","../README.*.md"], { query: '?raw' })
 *   `./pages/Home.vue` -> import.meta.glob(["./pages/Home.vue","./pages/Home.*.vue"], {})
 * Markdown is loaded `?raw` (string content); other files (e.g. `.vue`) export a component.
 * Returns `null` when the path has no extension (can't build a sensible glob).
 */
function fileToLocaleGlobExpr(rawPath) {
  const qIdx = rawPath.indexOf('?')
  const query = qIdx >= 0 ? rawPath.slice(qIdx + 1) : ''
  const pathOnly = qIdx >= 0 ? rawPath.slice(0, qIdx) : rawPath
  const dot = pathOnly.lastIndexOf('.')
  if (dot <= pathOnly.lastIndexOf('/')) return null
  const ext = pathOnly.slice(dot)
  const globs = [pathOnly, `${pathOnly.slice(0, dot)}.*${ext}`]
  const isMarkdown = /\.(?:md|markdown)$/i.test(ext) || /(?:^|&)raw(?:$|&)/.test(query)
  const opts = isMarkdown ? `{ query: '?raw' }` : `{}`
  return `import.meta.glob(${JSON.stringify(globs)}, ${opts})`
}

// Sugar so configs can name page files as plain strings; the CLI turns them into Vite globs so the
// per-locale files get bundled. Two shapes are rewritten in the user's JS/TS under `cwd`:
//   localizedPage('./file.md')  -> localizedPage(import.meta.glob([...], { query: '?raw' }))
//   page: './file.md'           -> page: import.meta.glob([...], { query: '?raw' })
//   shell.actions: ['./User.vue'] -> shell.actions: [() => import('./User.vue')]
// Loader functions, locale maps (`localizedPage({ en, zh })`) and explicit `import.meta.glob` are
// left untouched; the string forms only rewrite path-like values (starting with `.` or `/`).
function configSugarPlugin() {
  const CALL_STRING_ARG = /(\blocalizedPage\s*\(\s*)(['"`])((?:\\.|(?!\2).)*)\2/g
  const PAGE_STRING_FIELD = /(\bpage\s*:\s*)(['"`])((?:\\.|(?!\2).)*)\2/g
  const SHELL_ACTIONS_ARRAY = /(\bshell\s*:\s*\{[\s\S]*?\bactions\s*:\s*\[)([\s\S]*?)(\])/g
  const STRING_LITERAL = /(['"`])((?:\\.|(?!\1).)*)\1/g

  function rewriteShellActionArray(body) {
    return body.replace(STRING_LITERAL, (match, _q, rawPath, offset) => {
      if (!/^[./]/.test(rawPath)) return match

      const before = body.slice(0, offset)
      const after = body.slice(offset + match.length)
      if (!/(^|,)\s*$/.test(before) || !/^\s*(,|$)/.test(after)) return match

      return `() => import(${JSON.stringify(rawPath)})`
    })
  }

  return {
    name: 'vue-site:config-sugar',
    enforce: 'pre',
    transform(code, id) {
      const file = id.split('?')[0]
      if (!/\.(?:[cm]?[jt]sx?)$/.test(file)) return
      if (!file.startsWith(cwd) || file.includes('/node_modules/')) return
      if (
        !code.includes('localizedPage(') &&
        !/\bpage\s*:\s*['"`]/.test(code) &&
        !/\bshell\s*:\s*\{/.test(code)
      ) {
        return
      }
      let changed = false
      let out = code.replace(CALL_STRING_ARG, (match, head, _q, rawPath) => {
        const expr = fileToLocaleGlobExpr(rawPath)
        if (!expr) return match
        changed = true
        return `${head}${expr}`
      })
      out = out.replace(PAGE_STRING_FIELD, (match, head, _q, rawPath) => {
        // Only rewrite path-like values to avoid touching unrelated `page: '...'` properties.
        if (!/^[./]/.test(rawPath)) return match
        const expr = fileToLocaleGlobExpr(rawPath)
        if (!expr) return match
        changed = true
        return `${head}${expr}`
      })
      out = out.replace(SHELL_ACTIONS_ARRAY, (match, head, body, tail) => {
        const nextBody = rewriteShellActionArray(body)
        if (nextBody === body) return match
        changed = true
        return `${head}${nextBody}${tail}`
      })
      return changed ? { code: out, map: null } : undefined
    },
  }
}

const BUILTIN_ICON_NAMES = [
  'sun',
  'moon',
  'palette',
  'languages',
  'github',
  'coffee',
  'waves',
]

function normalizeLucideIconName(name) {
  const trimmed = String(name ?? '').trim()
  if (!trimmed) return ''
  return trimmed
    .replace(/^lucide[\s_-]?/i, '')
    .replace(/[\s_-]?icon$/i, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase()
}

function toPascalIconName(name) {
  return normalizeLucideIconName(name)
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
}

function readLucideIconExportMap() {
  const map = new Map()
  const entry = resolve(lucidePath, 'dist/esm/lucide-vue-next.js')
  const code = fs.readFileSync(entry, 'utf-8')
  const re = /export\s+\{([^}]+)\}\s+from\s+['"]\.\/icons\/([^'"]+)['"]/g
  let match

  while ((match = re.exec(code))) {
    const exports = match[1]
    const file = match[2]
    for (const part of exports.split(',')) {
      const alias = /default\s+as\s+([A-Za-z0-9_$]+)/.exec(part.trim())?.[1]
      if (alias) map.set(alias, file)
    }
  }

  return map
}

const lucideIconExportMap = readLucideIconExportMap()

function addIconName(set, value) {
  if (typeof value !== 'string') return
  const name = value.trim()
  if (name) set.add(name)
}

function collectNavIconNames(set, nav = []) {
  for (const item of nav) {
    addIconName(set, item?.icon)
    collectNavIconNames(set, item?.children ?? [])
  }
}

function collectIconNames(siteConfig = {}) {
  const names = new Set(BUILTIN_ICON_NAMES)
  const themeConfig =
    siteConfig.theme && typeof siteConfig.theme === 'object'
      ? siteConfig.theme
      : undefined

  collectNavIconNames(names, siteConfig.nav ?? [])

  for (const link of siteConfig.links ?? []) {
    addIconName(names, link?.icon)
  }
  for (const locale of siteConfig.i18n?.locales ?? []) {
    addIconName(names, locale?.icon)
  }
  for (const theme of themeConfig?.extraThemes ?? []) {
    addIconName(names, theme?.icon)
  }

  return [...names]
}

function buildIconRegistryCode(siteConfig) {
  const imports = []
  const entries = []
  const imported = new Map()
  const addedEntries = new Set()

  for (const name of collectIconNames(siteConfig)) {
    const normalized = normalizeLucideIconName(name)
    if (!normalized) continue

    const pascal = toPascalIconName(name)
    const iconSource =
      lucideIconExportMap.get(pascal) ??
      lucideIconExportMap.get(`${pascal}Icon`) ??
      `${normalized}.js`
    const iconFile = resolve(lucidePath, 'dist/esm/icons', iconSource)

    if (!fs.existsSync(iconFile)) {
      console.warn(
        `[vue-site] Icon "${name}" was not found in lucide-vue-next. It will render empty.`,
      )
      continue
    }

    let local = imported.get(normalized)
    if (!local) {
      local = `Icon${imported.size}`
      imported.set(normalized, local)
      imports.push(
        `import ${local} from ${JSON.stringify(
          `lucide-vue-next/dist/esm/icons/${iconSource}`,
        )}`,
      )
    }

    for (const key of new Set([name, normalized])) {
      if (addedEntries.has(key)) continue
      addedEntries.add(key)
      entries.push(`  ${JSON.stringify(key)}: ${local},`)
    }
  }

  return [
    ...imports,
    `export const iconRegistry = {`,
    ...entries,
    `}`,
  ].join('\n')
}

function vueSitePlugin(entryCode, htmlTemplate, iconRegistryCode) {
  return [
    {
      name: 'vue-site:virtual-entry',
      resolveId(id) {
        if (id === VIRTUAL_ENTRY) return RESOLVED_ENTRY
        if (id === VIRTUAL_PACKAGE) return RESOLVED_PACKAGE
        if (id === VIRTUAL_ICONS) return RESOLVED_ICONS
      },
      load(id) {
        if (id === RESOLVED_ENTRY) return entryCode
        if (id === RESOLVED_PACKAGE) {
          const url = readPackageRepositoryUrl()
          return `export const repositoryUrl = ${JSON.stringify(url)}`
        }
        if (id === RESOLVED_ICONS) return iconRegistryCode
      },
    },
    {
      name: 'vue-site:html',
      configureServer(server) {
        return () => {
          server.middlewares.use(async (req, res, next) => {
            if (req.url === '/' || req.url === '/index.html') {
              const html = await server.transformIndexHtml(
                req.url,
                htmlTemplate,
              )
              res.writeHead(200, { 'Content-Type': 'text/html' })
              res.end(html)
              return
            }
            next()
          })
        }
      },
    },
  ]
}

async function buildViteConfig(options = {}) {
  const { cliBase, configFile, siteConfig: siteConfigOption } = options
  const siteConfig = siteConfigOption ?? (await loadSiteConfig(configFile))
  const env = siteConfig.env || {}
  const {
    port,
    outDir,
    customElements = [],
    vite: userVite = {},
  } = env
  const watchPackages =
    env.watchPackages !== undefined
      ? env.watchPackages
      : siteConfig.watchPackages ?? []
  const { vue: userVueOpts = {}, plugins: userPlugins, ...userViteRest } =
    userVite

  const vueOpts = { ...userVueOpts }
  if (customElements.length) {
    vueOpts.template = {
      ...vueOpts.template,
      compilerOptions: {
        ...vueOpts.template?.compilerOptions,
        isCustomElement: (tag) =>
          customElements.some((prefix) => tag.startsWith(prefix)),
      },
    }
  }

  // Absolute source root directories for packages using entryPath, used by the
  // scss-raw plugin below to prevent Vite's module cache from returning an
  // already-transformed JS module to Sass on a second resolution of the same file.
  const watchedSourceRoots = []

  if (watchPackages.length) {
    const excludeNames = []
    const watchPatterns = []
    const localAliases = {}
    const fsAllowPaths = []

    for (const pkg of watchPackages) {
      if (typeof pkg === 'string') {
        excludeNames.push(pkg)
        watchPatterns.push(`!**/node_modules/${pkg}/**`)
      } else {
        const entryAbs = resolve(cwd, pkg.entryPath)
        const entryDir = dirname(entryAbs)
        if (!fs.existsSync(entryAbs)) {
          console.warn(
            `[vue-site] env.watchPackages: entry not found (entryPath is relative to the directory where you run the CLI):\n  ${entryAbs}\n  package: ${pkg.name}`,
          )
        }
        excludeNames.push(pkg.name)
        localAliases[pkg.name] = entryAbs
        const dirForGlob = entryDir.replace(/\\/g, '/')
        watchPatterns.push(`!${dirForGlob}/**`)
        fsAllowPaths.push(entryDir)
        // Track the package root (parent of entryDir) so SCSS imports that use
        // paths like '../styles/foo.scss' are also covered.
        watchedSourceRoots.push(dirname(entryDir))
      }
    }

    userViteRest.optimizeDeps = {
      ...userViteRest.optimizeDeps,
      exclude: [
        ...(userViteRest.optimizeDeps?.exclude || []),
        ...excludeNames,
      ],
    }
    userViteRest.server = {
      ...userViteRest.server,
      watch: {
        ...userViteRest.server?.watch,
        ignored: [
          ...(userViteRest.server?.watch?.ignored || []),
          ...watchPatterns,
        ],
      },
    }
    if (Object.keys(localAliases).length) {
      const prevAlias = userViteRest.resolve?.alias
      const extraPairs = Object.entries(localAliases).map(([find, replacement]) => ({
        find,
        replacement,
      }))
      let mergedAlias
      if (prevAlias == null) {
        mergedAlias = { ...localAliases }
      } else if (Array.isArray(prevAlias)) {
        mergedAlias = [...prevAlias, ...extraPairs]
      } else {
        mergedAlias = { ...prevAlias, ...localAliases }
      }
      userViteRest.resolve = {
        ...userViteRest.resolve,
        alias: mergedAlias,
      }
    }
    if (fsAllowPaths.length) {
      userViteRest.server = {
        ...userViteRest.server,
        fs: {
          ...userViteRest.server?.fs,
          allow: [
            ...(userViteRest.server?.fs?.allow || []),
            ...fsAllowPaths,
          ],
        },
      }
    }
  }

  const entryCode = buildEntryCode(siteConfig, configFile)
  const iconRegistryCode = buildIconRegistryCode(siteConfig)
  const htmlTemplate = buildHtmlShell(
    `<script type="module" src="/@id/__x00__${VIRTUAL_ENTRY}"></script>`,
    siteConfig,
  )

  // When watchPackages uses entryPath, SCSS files imported inside the watched
  // package source (e.g. Lit web components with `import styles from './foo.scss'`
  // used alongside `unsafeCSS()`) need to be exported as a CSS string, not
  // injected as a side-effect.  Vite only does this for `?inline` imports.
  // This pre-plugin intercepts .scss/.sass imports whose importer lives inside a
  // watched source root and transparently adds `?inline`, so Vite compiles the
  // SCSS through Sass and returns `export default "...css..."`.
  const watchedScssPlugin =
    watchedSourceRoots.length > 0
      ? [
          {
            name: 'vue-site:watched-scss-inline',
            enforce: 'pre',
            async resolveId(source, importer) {
              if (!importer) return
              const cleanImporter = importer.split('?')[0]
              const cleanSource = source.split('?')[0]
              if (
                (cleanSource.endsWith('.scss') || cleanSource.endsWith('.sass')) &&
                !source.includes('?') &&
                watchedSourceRoots.some((root) => cleanImporter.startsWith(root))
              ) {
                const resolved = await this.resolve(source, importer, { skipSelf: true })
                if (resolved && !resolved.external) {
                  return { id: resolved.id + '?inline' }
                }
              }
            },
          },
        ]
      : []
  const elementPlusResolver = ElementPlusResolver({
    importStyle: 'css',
  })

  const baseConfig = {
    root: cwd,
    plugins: [
      configSugarPlugin(),
      AutoImport({
        resolvers: [elementPlusResolver],
        dts: false,
      }),
      Components({
        resolvers: [elementPlusResolver],
        dts: false,
      }),
      vue(vueOpts),
      ...watchedScssPlugin,
      ...vueSitePlugin(entryCode, htmlTemplate, iconRegistryCode),
      ...(userPlugins || []),
    ],
    resolve: {
      alias: [
        { find: /^@bndynet\/vue-site$/, replacement: frameworkEntry },
        {
          find: /^@bndynet\/vue-site\/style\.css$/,
          replacement: frameworkStyle,
        },
        {
          find: 'vue',
          replacement: resolve(vuePath, 'dist/vue.runtime.esm-bundler.js'),
        },
        {
          find: 'vue-router',
          replacement: resolve(vueRouterPath, 'dist/vue-router.mjs'),
        },
        {
          find: /^lucide-vue-next$/,
          replacement: toVitePath(resolve(lucidePath, 'dist/esm/lucide-vue-next.js')),
        },
        {
          find: /^lucide-vue-next\//,
          replacement: `${lucideAliasPath}/`,
        },
        {
          find: /^element-plus$/,
          replacement: toVitePath(resolve(elementPlusPath, 'es/index.mjs')),
        },
        {
          find: /^element-plus\//,
          replacement: `${elementPlusAliasPath}/`,
        },
        {
          find: /^@element-plus\/icons-vue$/,
          replacement: toVitePath(resolve(elementPlusIconsPath, 'dist/index.js')),
        },
        {
          find: /^@element-plus\/icons-vue\//,
          replacement: `${elementPlusIconsAliasPath}/`,
        },
        {
          find: /^dayjs$/,
          replacement: dayjsAliasPath,
        },
        {
          find: /^dayjs\//,
          replacement: `${dayjsAliasPath}/`,
        },
      ],
    },
    optimizeDeps: {
      // The virtual entry and user-authored pages both import the framework.
      // Keep it out of dependency pre-bundling so Vite does not instantiate
      // `dist/index.es.js` once via /@fs and again via node_modules/.vite.
      exclude: [FRAMEWORK_PACKAGE],
      // Element Plus imports dayjs from ESM files, but dayjs itself ships as
      // CommonJS. Force Vite's CJS interop for the package while letting
      // discovered `dayjs/*` plugin imports be optimized normally.
      include: ['dayjs'],
      needsInterop: ['dayjs'],
    },
    server: {
      open: true,
      ...(port != null && { port }),
      fs: {
        allow: defaultServerFsAllow,
      },
    },
    build: {
      outDir: resolve(cwd, outDir || `${basename(cwd)}-dist`),
      emptyOutDir: true,
    },
    ...(cliBase != null && { base: cliBase }),
  }

  return mergeConfig(userViteRest, baseConfig)
}

async function run() {
  const { command, cliBase, cliConfig } = parseCliArgv()
  const configFile = resolveSiteConfig(cliConfig)
  const siteConfig = await loadSiteConfig(configFile)
  const viteConfig = await buildViteConfig({ cliBase, configFile, siteConfig })

  if (command === 'dev') {
    const server = await createServer(viteConfig)
    await server.listen()
    server.printUrls()
    server.bindCLIShortcuts({ print: true })
  } else if (command === 'build') {
    const tempHtml = resolve(cwd, 'index.html')
    const hadHtml = fs.existsSync(tempHtml)

    if (!hadHtml) {
      const bootstrapScript = buildBootstrapScript({
        siteConfig,
        siteConfigSpecifier: `./${configFile}`,
      })
      const buildHtml = buildHtmlShell(
        `<script type="module">\n${bootstrapScript}\n  </script>`,
        siteConfig,
      )
      fs.writeFileSync(tempHtml, buildHtml)
    }

    try {
      await build(viteConfig)
    } finally {
      if (!hadHtml) {
        fs.unlinkSync(tempHtml)
      }
    }
  } else if (command === 'preview') {
    const server = await preview(
      mergeConfig(viteConfig, { preview: { open: true } }),
    )
    server.printUrls()
  } else {
    console.log(
      'Usage: vue-site|vs <dev|build|preview> [--base=<path>] [--config=<file>]\n' +
        '  --base         Public path for assets (overrides env.vite.base); e.g. --base=/app/\n' +
        '  --config, -c   Site config file in the current site root; e.g. site.config.prod.ts',
    )
    process.exit(1)
  }
}

run().catch((err) => {
  console.error(err instanceof CliConfigError ? err.message : err)
  process.exit(1)
})
