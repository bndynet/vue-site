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
const command = process.argv[2] || 'dev'

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

const entryCode = [
  `import { createSiteApp } from '${pkgDir.replace(/\\/g, '/')}/dist/index.es.js'`,
  `import '${pkgDir.replace(/\\/g, '/')}/dist/style.css'`,
  `import siteConfig from '/${foundConfig}'`,
  `import { repositoryUrl } from '${VIRTUAL_PACKAGE}'`,
  `createSiteApp({ ...siteConfig, packageRepository: repositoryUrl }).mount('#app')`,
].join('\n')

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

function vueSitePlugin() {
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

async function buildViteConfig() {
  const siteConfig = await loadSiteConfig()
  const {
    port,
    outDir,
    customElements = [],
    watchPackages = [],
    vite: userVite = {},
  } = siteConfig.env || {}
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
        const entryDir = entryAbs.replace(/\/[^/]+$/, '')
        excludeNames.push(pkg.name)
        localAliases[pkg.name] = entryAbs
        watchPatterns.push(`!${entryDir}/**`)
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
      userViteRest.resolve = {
        ...userViteRest.resolve,
        alias: { ...userViteRest.resolve?.alias, ...localAliases },
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

  const baseConfig = {
    root: cwd,
    plugins: [vue(vueOpts), ...vueSitePlugin(), ...(userPlugins || [])],
    resolve: {
      alias: {
        vue: resolve(vuePath, 'dist/vue.runtime.esm-bundler.js'),
        'vue-router': resolve(vueRouterPath, 'dist/vue-router.mjs'),
      },
    },
    server: {
      open: true,
      ...(port != null && { port }),
      fs: {
        allow: [cwd, pkgDir],
      },
    },
    build: {
      outDir: resolve(cwd, outDir || `${basename(cwd)}-dist`),
      emptyOutDir: true,
    },
  }

  return mergeConfig(userViteRest, baseConfig)
}

async function run() {
  const viteConfig = await buildViteConfig()

  if (command === 'dev') {
    const server = await createServer(viteConfig)
    await server.listen()
    server.printUrls()
    server.bindCLIShortcuts({ print: true })
  } else if (command === 'build') {
    const tempHtml = resolve(cwd, 'index.html')
    const hadHtml = fs.existsSync(tempHtml)

    if (!hadHtml) {
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
import { createSiteApp } from '${pkgDir.replace(/\\/g, '/')}/dist/index.es.js'
import '${pkgDir.replace(/\\/g, '/')}/dist/style.css'
import siteConfig from './${foundConfig}'
import { repositoryUrl } from '${VIRTUAL_PACKAGE}'
createSiteApp({ ...siteConfig, packageRepository: repositoryUrl }).mount('#app')
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
    console.log('Usage: vue-site|vs <dev|build|preview>')
    process.exit(1)
  }
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
