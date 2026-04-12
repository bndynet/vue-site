#!/usr/bin/env node

import { createServer, build, preview, mergeConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve, dirname, basename } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import { createRequire } from 'module'
import { transform } from 'esbuild'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const pkgDir = resolve(__dirname, '..')
const require = createRequire(import.meta.url)

function resolvePkgDir(pkg) {
  return dirname(require.resolve(`${pkg}/package.json`))
}

const vuePath = resolvePkgDir('vue')
const vueRouterPath = resolvePkgDir('vue-router')
const cwd = process.cwd()
/** Lets `import('../file.md?raw')` work when `site.config` lives in a subfolder (README next to cwd). In-repo, ../ often falls under pkgDir; from npm install it does not, so we allow cwd's parent explicitly. */
const cwdParent = resolve(cwd, '..')
/** Two levels up: monorepos (`apps/docs` importing `../../packages/...`). Omitted when that would be the FS root (too permissive for dev). */
const cwdGrandparent = resolve(cwd, '../..')

/**
 * @param {string[]} argv
 * @returns {{ command: string, cliBase?: string }}
 */
function parseCliArgv(argv = process.argv) {
  const sub = argv[2]
  const command =
    sub && !sub.startsWith('-')
      ? sub
      : 'dev'

  let cliBase
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
    }
  }
  return { command, cliBase }
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
const foundConfig = configCandidates.find((f) => fs.existsSync(resolve(cwd, f)))
if (!foundConfig) {
  console.error(
    '\x1b[31mError: No site.config.ts found in the current directory.\x1b[0m\n\n' +
    'Create a site.config.ts file:\n\n' +
    '  import type { SiteConfig } from \'@bndynet/vue-site\'\n\n' +
    '  export default {\n' +
    '    title: \'My Site\',\n' +
    '    nav: [\n' +
    '      { label: \'Home\', icon: \'home\', page: () => import(\'./README.md?raw\') },\n' +
    '    ],\n' +
    '  } satisfies SiteConfig\n'
  )
  process.exit(1)
}

const VIRTUAL_ENTRY = 'virtual:vue-site-entry'
const RESOLVED_ENTRY = '\0' + VIRTUAL_ENTRY
const VIRTUAL_PACKAGE = 'virtual:vue-site-package'
const RESOLVED_PACKAGE = '\0' + VIRTUAL_PACKAGE

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

// Static import bundles bootstrap for production; dynamic import with vite-ignore is not emitted.
function buildEntryCode(siteConfig) {
  const bs = siteConfig?.bootstrap
  const bootstrapImport =
    bs != null && String(bs).trim() !== ''
      ? `import '${resolveBootstrapUrl(bs)}'\n`
      : ''
  return [
    bootstrapImport,
    `import 'element-plus/dist/index.css'`,
    `import 'element-plus/theme-chalk/dark/css-vars.css'`,
    `import { createSiteApp } from '${pkgDir.replace(/\\/g, '/')}/dist/index.es.js'`,
    `import '${pkgDir.replace(/\\/g, '/')}/dist/style.css'`,
    `import siteConfig from '/${foundConfig}'`,
    `import { repositoryUrl } from '${VIRTUAL_PACKAGE}'`,
    `;(async () => {`,
    `  const app = await createSiteApp({ ...siteConfig, packageRepository: repositoryUrl })`,
    `  app.mount('#app')`,
    `})()`,
  ].join('\n')
}

const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title></title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/@id/__x00__${VIRTUAL_ENTRY}"></script>
</body>
</html>`

async function loadSiteConfig() {
  const configPath = resolve(cwd, foundConfig)
  const raw = fs.readFileSync(configPath, 'utf-8')

  const isTs = /\.m?ts$/.test(foundConfig)
  const { code } = await transform(raw, {
    loader: isTs ? 'ts' : 'js',
    format: 'esm',
  })

  const stubbed = code.replace(
    /import\s*\{[^}]*defineConfig[^}]*\}\s*from\s*['"][^'"]*['"]\s*;?/g,
    'const defineConfig = (c) => c;',
  )

  const tmpFile = resolve(cwd, `.site-config.${Date.now()}.tmp.mjs`)
  fs.writeFileSync(tmpFile, stubbed)

  try {
    const mod = await import(pathToFileURL(tmpFile).href)
    return mod.default || {}
  } catch (e) {
    console.warn(
      `[vue-site] Could not pre-load site config from ${foundConfig}: ${e.message}`,
    )
    return {}
  } finally {
    try {
      fs.unlinkSync(tmpFile)
    } catch {}
  }
}

function vueSitePlugin(entryCode) {
  return [
    {
      name: 'vue-site:virtual-entry',
      resolveId(id) {
        if (id === VIRTUAL_ENTRY) return RESOLVED_ENTRY
        if (id === VIRTUAL_PACKAGE) return RESOLVED_PACKAGE
      },
      load(id) {
        if (id === RESOLVED_ENTRY) return entryCode
        if (id === RESOLVED_PACKAGE) {
          const url = readPackageRepositoryUrl()
          return `export const repositoryUrl = ${JSON.stringify(url)}`
        }
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
  const { cliBase, siteConfig: siteConfigOption } = options
  const siteConfig = siteConfigOption ?? (await loadSiteConfig())
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

  const entryCode = buildEntryCode(siteConfig)

  const baseConfig = {
    root: cwd,
    plugins: [vue(vueOpts), ...vueSitePlugin(entryCode), ...(userPlugins || [])],
    resolve: {
      alias: {
        vue: resolve(vuePath, 'dist/vue.runtime.esm-bundler.js'),
        'vue-router': resolve(vueRouterPath, 'dist/vue-router.mjs'),
      },
    },
    optimizeDeps: {
      // dayjs ships a UMD browser build (dayjs.min.js) which has no ESM default
      // export. Listing it here forces Vite to pre-bundle it into a proper ESM
      // module before the browser requests it — preventing the
      // "does not provide an export named 'default'" SyntaxError from Element Plus.
      include: [
        'dayjs',
        'dayjs/plugin/localeData',
        'dayjs/plugin/advancedFormat',
        'dayjs/plugin/customParseFormat',
        'dayjs/plugin/weekOfYear',
        'dayjs/plugin/weekYear',
        'dayjs/plugin/dayOfYear',
        'dayjs/plugin/isSameOrAfter',
        'dayjs/plugin/isSameOrBefore',
      ],
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
  const { command, cliBase } = parseCliArgv()
  const siteConfig = await loadSiteConfig()
  const viteConfig = await buildViteConfig({ cliBase, siteConfig })

  if (command === 'dev') {
    const server = await createServer(viteConfig)
    await server.listen()
    server.printUrls()
    server.bindCLIShortcuts({ print: true })
  } else if (command === 'build') {
    const tempHtml = resolve(cwd, 'index.html')
    const hadHtml = fs.existsSync(tempHtml)

    if (!hadHtml) {
      const bs = siteConfig?.bootstrap
      const bootstrapImport =
        bs != null && String(bs).trim() !== ''
          ? `import '${resolveBootstrapUrl(bs)}'\n`
          : ''
      const buildHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title></title>
</head>
<body>
  <div id="app"></div>
  <script type="module">
${bootstrapImport}import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import { createSiteApp } from '${pkgDir.replace(/\\/g, '/')}/dist/index.es.js'
import '${pkgDir.replace(/\\/g, '/')}/dist/style.css'
import siteConfig from './${foundConfig}'
import { repositoryUrl } from '${VIRTUAL_PACKAGE}'
;(async () => {
  const app = await createSiteApp({ ...siteConfig, packageRepository: repositoryUrl })
  app.mount('#app')
})()
  </script>
</body>
</html>`
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
      'Usage: vue-site|vs <dev|build|preview> [--base=<path>]\n' +
        '  --base   Public path for assets (overrides env.vite.base); e.g. --base=/app/',
    )
    process.exit(1)
  }
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
