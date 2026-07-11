# @bndynet/vue-site

可配置的 Vue 3 站点框架：一个依赖包、一份 `site.config.ts` 以及 Markdown 页面 —— 即可获得侧边栏、语法高亮代码块、亮色/暗色主题。无需手写 `main.ts`、`index.html` 或 `vite.config.ts`。

## 特性

- 配置驱动的导航（使用 Lucide 图标名）
- 通过 `visible` 断言进行权限控制的导航（同步或异步；隐藏条目并跳过其路由）
- 通过 `auth` + 中心化的 `authorize` 策略实现按页面授权（导航守卫 + 登录重定向）
- Hash 或 HTML5（`web`）路由历史模式，可在 `site.config.ts` 中配置
- 支持 Markdown（`?raw`）或 Vue 页面
- highlight.js、亮色/暗色主题 + localStorage 持久化
- 内置多语言支持（语言切换器、`LocalizedString` 配置、按语言区分的页面）—— 参见[国际化](#国际化-i18n)
- 将项目的 `README.md` 作为首页
- 完整的 TypeScript 类型

## 快速开始

**安装**

```bash
npm install @bndynet/vue-site
```

**`site.config.ts`**

```typescript
import { defineConfig } from '@bndynet/vue-site'

export default defineConfig({
  title: 'My Project',
  favicon: '/favicon.ico',
  nav: [
    { label: 'Home', icon: 'home', page: () => import('./README.md?raw') },
    { label: 'Guide', icon: 'book-open', page: () => import('./pages/guide.md?raw') },
  ],
})
```

**目录结构**

```
my-site/
  package.json
  site.config.ts
  public/favicon.ico
  README.md
  pages/guide.md
```

**CLI**（`vue-site` 与 `vs` 等价）

```bash
npx vue-site dev
npx vue-site build
npx vue-site preview
```

子路径部署：在 CLI 上传入 Vite 的公共 base（会覆盖 `site.config` 中的 `env.vite.base`）：

```bash
npx vue-site build --base=/app/
# 或
npx vue-site build --base /app/
```

如果愿意，可以在 `package.json` 的 scripts 中加上 `"dev": "vue-site dev"`（或 `vs dev`）。

## 配置参考

### `SiteConfig`

| 属性 | 说明 |
|----------|-------------|
| `title` | 站点标题（侧边栏 + 标签页）。`LocalizedString` |
| `nav` | `NavItem[]` |
| `navPosition` | 可选的导航位置：`'top'` 强制使用顶部/分层导航，`'sidebar'` 强制将完整导航树放在侧边栏。不传时保持基于导航深度的自动行为 |
| `defaultPath` | 站点打开时的路径；`/` 和未知路径会重定向到此。必须匹配一个已注册的路由（某个 `nav` 条目解析后的路径，或某个 `pages` 条目的 `path`）。默认为第一个顶级 `nav` 条目 |
| `favicon` | 浏览器标签页图标 URL。可使用 public 资源路径、远程 URL 或导入后的资源 URL |
| `logo` | Logo 的 URL 或导入的图片 |
| `theme` | 见下方 `ThemeConfig`；设为 `false` 可禁用主题（隐藏切换器、强制使用固定的 `light` 调色板、不进行 localStorage 持久化） |
| `i18n` | 多语言配置（`I18nConfig`）—— 参见[国际化](#国际化-i18n) |
| `footer` | 页脚文本。`LocalizedString` |
| `readme` | 当没有 `README.md` 时作为首页的原始内容 |
| `links` | 头部链接：Lucide `icon` + `link`，可选的 `title`（`LocalizedString`） |
| `pages` | `StandalonePage[]` —— 位于 `nav` 树之外的全屏路由（无顶部栏/侧边栏/页脚） |
| `auth` | 中心化的授权策略（`AuthConfig`）—— 参见[按页面授权](#按页面授权-auth) |
| `router` | 历史模式（`RouterConfig`）—— `hash`（默认）或 HTML5 `web`；参见[路由历史](#路由历史-router) |
| `packageRepository` | 通常由 CLI 从 `package.json` 设置；单独使用 `createSiteApp` 时可省略 |
| `env` | 开发/构建选项 —— 见下文 |
| `bootstrap` | 可选的站点根目录相对路径（如 `./bootstrap.ts`）—— 在 Vue 应用之前加载一次的模块 |
| `configureApp` | 可选的 `(app) => void \| Promise<void>`，在路由安装之后、`mount` 之前执行（参见 [`configureApp` 中的本地包](#在-configureapp-中使用本地包)） |

### `NavItem`

| 属性 | 说明 |
|----------|-------------|
| `label` | 侧边栏文本。`LocalizedString` |
| `icon` | [Lucide](https://lucide.dev/icons) 图标名 |
| `page` | 页面内容。最简单的是一个**文件路径字符串**，如 `'./pages/AdminView.vue'` 或 `'./README.md'`（自动加载各语言的同名文件，找不到时回退到基础文件）。也接受加载器（`() => import('./Page.vue')` / `() => import('./page.md?raw')`）或 `localizedPage(...)` 的返回值。见[按语言区分的页面内容](#按语言区分的页面内容)与[高级页面加载器](#高级页面加载器) |
| `path` | 路由路径（省略时从 `label` 的默认语言值派生；切换语言时保持稳定） |
| `layout` | 页面内容宽度：`'default'` 保持标准居中阅读宽度，`'wide'` 使用更宽的居中画布，`'full'` 以无框架内边距的方式填满可用父容器。对分组和链接无效。 |
| `children` | 嵌套分组 |
| `link` | 渲染为超链接（内部路由路径或外部 URL），而非页面路由 |
| `visible` | `() => boolean \| Promise<boolean>`，在启动时等待执行一次。返回 `false` 会从导航中隐藏该条目并跳过其路由（无法通过直接 URL 访问）。被隐藏的父项会隐藏其整个子树；没有剩余子项的分组会被剪除。对后续变化不具响应性。 |
| `auth` | 由 `auth.authorize` 解释的授权规则（`AuthRule`）。会保持路由注册并通过导航守卫强制执行（因此直接访问 URL 会重定向到登录页）。需要配置 `SiteConfig.auth`。参见[按页面授权](#按页面授权-auth)。 |

### `StandalonePage`

| 属性 | 说明 |
|----------|-------------|
| `path` | 路由路径，按原样使用（如 `/landing`） |
| `page` | 页面内容。接受形式与 `NavItem.page` 相同 |
| `layout` | 可选内容宽度。省略时保持 standalone 默认行为：全屏、无内边距画布。 |
| `visible` | `() => boolean \| Promise<boolean>`，在启动时等待执行一次。返回 `false` 会跳过该路由注册。 |
| `auth` | 授权规则（`AuthRule`），由与 `NavItem.auth` 相同的导航守卫强制执行。 |

### 页面布局

当默认阅读宽度太窄时，可以在 `NavItem` 页面上设置 `layout`：

```typescript
export default defineConfig({
  nav: [
    { label: 'Docs', icon: 'book', page: './pages/docs.md' },
    { label: 'Reports', icon: 'table', layout: 'wide', page: './pages/reports.vue' },
    { label: 'Dashboard', icon: 'gauge', layout: 'full', page: './pages/dashboard.vue' },
  ],
})
```

### `ThemeConfig`

内置主题为 `light`、`dark`，外加始终可用的额外主题 `sepia` 和 `ocean`（在每个站点的切换器中都会显示）。在 `SiteConfig` 上设置 `theme: false` 可完全禁用主题。

| 属性 | 默认值 | 说明 |
|----------|---------|-------------|
| `default` | `light` | `light`、`dark`、内置额外主题 id（`sepia`、`ocean`），或某个 `extraThemes[].id` |
| `colors` | — | 全局 CSS 变量覆盖 |
| `palettes` | — | 仅针对内置 light/dark 的部分覆盖 |
| `extraThemes` | — | 额外主题：`id`、`label`、`icon`，可选 `basedOn`、`palette`；复用内置 id（`sepia`/`ocean`）即可覆盖它。导入 `builtinThemePalettes` 获取完整默认值 |

## 国际化（`i18n`）

设置 `i18n` 以启用多语言支持。框架会在头部添加语言切换器，
针对当前激活的语言解析每一个 `LocalizedString` 字段（`title`、`nav[].label`、`footer`、`links[].title`），
并通过 `useLocale()` / `useLocalize()` 暴露当前语言。

```typescript
import { defineConfig } from '@bndynet/vue-site'

export default defineConfig({
  i18n: {
    locales: [
      { code: 'en', label: 'English' },
      { code: 'zh', label: '简体中文', icon: 'languages' },
    ],
    defaultLocale: 'en',
  },
  title: { en: 'My Site', zh: '我的站点' }, // 一个 LocalizedString
  footer: { en: '© 2026', zh: '© 2026 版权所有' },
  nav: [
    { label: { en: 'Home', zh: '首页' }, icon: 'home', page: '../README.md' },
    {
      label: { en: 'Guide', zh: '指南' },
      icon: 'book',
      // 按语言区分的内容：./pages/guide.md（基础）+ guide.zh.md，由 CLI 自动发现。
      page: './pages/guide.md',
    },
  ],
})
```

### 按语言区分的页面内容

把 `page` 指向一个**文件路径字符串**，框架就会为当前语言加载正确的文件 —— 无需任何额外接线：

```typescript
import { defineConfig, tk } from '@bndynet/vue-site'

export default defineConfig({
  i18n: { locales: [{ code: 'en' }, { code: 'zh' }], defaultLocale: 'en' },
  nav: [
    // 加载 ../README.md；当语言为 `zh` 时自动改用 ../README.zh.md。
    { label: tk('nav.home'), icon: 'home', page: '../README.md' },
    // Vue 页面同理：Dashboard.vue + Dashboard.zh.vue。
    { label: tk('nav.dash'), icon: 'gauge', page: './pages/Dashboard.vue' },
  ],
})
```

- 在基础文件旁边以 `名.<code>.<ext>` 命名各语言变体 —— `README.zh.md`、`Dashboard.zh.vue`……
- 没有对应文件的语言会回退到**基础文件**（`README.md`）。解析顺序：精确匹配 → 主子标签（`zh-TW` → `zh`）→ 基础文件。
- **新增语言只需放入一个 `名.<code>` 文件 —— 无需改配置。**
- 支持 Markdown（`.md`）和 Vue（`.vue`）。基础名称不能包含点号（`README.md` ✓，`my.page.md` ✗）。

> 字符串形式由 `vue-site` CLI 在构建时解析。如果你自行嵌入该库（不使用 CLI —— 见[库模式](#库模式)），
> 请改用[高级页面加载器](#高级页面加载器)中的加载器。

### 高级页面加载器

> **一般用不到。** 上面的文件路径字符串已能覆盖大多数站点。只有在你需要一个普通的单文件加载器、
> 各语言文件**不同名**，或在**不使用 CLI**（库模式）时，才需要用到这些。

除了字符串，`page` 还接受一个**加载器函数**或 `localizedPage(...)` 的返回值：

- **单文件、不做多语言** —— 一个普通的动态导入：

  ```typescript
  page: () => import('./pages/Dashboard.vue')   // Markdown 用 () => import('./guide.md?raw')
  ```

- **显式语言映射** —— 当各语言文件不共享基础名称（字符串形式无法推断）时：

  ```typescript
  import { localizedPage } from '@bndynet/vue-site'

  page: localizedPage({
    en: () => import('./pages/guide-en.md?raw'),
    zh: () => import('./pages/guide-zh.md?raw'),
  })
  ```

- **glob（库模式）** —— 与字符串形式相同的自动发现，但显式写出，因此不依赖 CLI：

  ```typescript
  page: localizedPage(import.meta.glob(['../README.md', '../README.*.md'], { query: '?raw' }))
  ```

  `page: '../README.md'` 正是 CLI 帮你生成的这一段。（Vue 页面去掉 `{ query: '?raw' }` 即可。）

所有 `localizedPage` 形式在当前语言没有对应文件时都会回退（精确匹配 → 主子标签 → 基础文件 → 第一个）。

### 工作原理

- **初始语言**：已存储的选择（localStorage）> 浏览器语言（`navigator.language`，当开启 `detectBrowser` 时）> `defaultLocale` > 第一个条目。
- **`LocalizedString`** 为 `string | Record<LocaleCode, string> | MessageRef`。普通字符串会原样返回
  （单语言配置照常工作），语言映射保存内联的按语言文本，而 `MessageRef`（用 `tk('id')` 构建）
  引用中心化消息文件中的某个键 —— 参见[中心化消息文件](#消息文件与键-tk--t)。
- **稳定的 URL**：路由路径从**默认语言**的 label（或显式 `path`）派生，因此切换语言永远不会改变 URL。
- **响应式**：切换语言会实时更新 label、标题、页脚和页面内容（页面内容通过 `localizedPage` 重新加载）。
  仅当 `locales.length > 1` 时才会出现切换器。
- **UI 字符串**：框架自带内置字符串（目前为 `en`、`zh`）用于主题/语言切换器和页面错误提示；
  可通过 `i18n.messages` 按语言覆盖或扩展它们。

### `I18nConfig`

| 属性 | 默认值 | 说明 |
|----------|---------|-------------|
| `locales` | 自动发现的 `locales/*.json` | `{ code, label, icon? }[]` —— 支持的语言，按显示顺序排列。可选：省略时从自动加载的文件名派生（使用内置标签）。第一个条目为回退项 |
| `defaultLocale` | `locales[0].code` | 当没有存储值且检测未命中时使用的初始语言 |
| `detectBrowser` | `true` | 首次访问时从 `navigator.language(s)` 检测初始语言 |
| `storageKey` | `vue-site-locale` | 用于存储所选语言的 localStorage 键 |
| `messages` | 自动从 `locales/<code>.json` 加载 | `Record<LocaleCode, Record<string, string>>` —— 额外/覆盖的翻译，会合并到自动加载的文件和内置 UI 字符串之上 |

### 消息文件与键（`tk` / `t`）

与其到处内联 `{ en, zh }`，不如把所有翻译放在纯 JSON 中 —— **每种语言一个文件** —— 并通过键引用它们。
这是零配置的：CLI 会在你的 `site.config.ts` 旁自动发现 `locales/<code>.json`。
你无需编写任何粘合代码（无需 `index.ts`，无需 `messages` 字段），甚至不必列出语言。

```jsonc
// locales/en.json —— 嵌套分组（推荐），会被展平为点号分隔的 id
{
  "site": { "title": "My Site" },
  "nav": { "home": "Home", "guide": "Guide" }
}
```

```jsonc
// locales/zh.json
{
  "site": { "title": "我的站点" },
  "nav": { "home": "首页", "guide": "指南" }
}
```

> 文件可以是**嵌套的**（如上）或**扁平的**（`{ "site.title": "My Site" }`）—— 嵌套分组会被
> 展平为点号分隔的 id，因此 `tk('site.title')` / `t('site.title')` 两种写法都能工作。

```typescript
// site.config.ts —— 在配置中用 tk() 引用键，在页面中用 t()
import { defineConfig, tk } from '@bndynet/vue-site'

export default defineConfig({
  // `i18n` 可以完全省略：语言列表会从文件名（en、zh、……）派生，
  // 并带有友好的内置标签。仅当需要自定义 label/icon/顺序时才声明它。
  i18n: {
    locales: [
      { code: 'en', label: 'English' },
      { code: 'zh', label: '简体中文', icon: 'languages' },
    ],
    defaultLocale: 'en',
  },
  title: tk('site.title'),
  nav: [
    { label: tk('nav.home'), icon: 'home', page: '../README.md' },
    {
      label: tk('nav.guide'),
      icon: 'book',
      page: './pages/guide.md',
    },
  ],
})
```

键的解析会依次回退：当前语言的主子标签 → `defaultLocale` → `en` → id 本身，并对 `{name}`
占位符进行插值。`tk()` 与内联 `{ en, zh }` 映射可以自由混用 —— 对共享/集中管理的文本用 `tk()`，
对一次性字符串用内联映射。

**自动发现的细节与覆盖**

- 约定是 `locales/<code>.json`（如 `locales/en.json`、`locales/zh.json`），相对于配置目录解析。
  `code` 即文件名（一个 `LocaleCode`，如 `en` 或 `zh-TW`）。
- 仍支持显式的 `i18n.messages`，并会**覆盖**自动加载的键（按 id）；显式的 `i18n.locales`
  控制 label/icon/顺序。两者均为可选。
- 自动发现是 **CLI** 特性。如果你自行嵌入该库（不使用 `vue-site` CLI 而直接调用 `createSiteApp`），
  请直接传入 `i18n.messages` —— 例如用显式 import 从 JSON 构建（避免在 `site.config.ts` 中使用
  `import.meta.glob`，CLI 会在 Node 中预加载它）。

### 在你自己的页面中本地化

`useLocalize()` 返回 `t(id, params?)`（从中心目录解析消息 id，并对 `{name}` 进行插值）、
`localize(value)`（解析任意 `LocalizedString` —— `tk()` 引用、内联映射或普通字符串），
以及响应式的 `locale` ref。`useLocale()` 返回 `{ locale, setLocale, locales }`，
用于构建自定义切换器。它们都可在由 `createSiteApp` 渲染的任意组件中工作。

```vue
<script setup lang="ts">
import { useLocalize } from '@bndynet/vue-site'

const { t, localize, locale } = useLocalize()
</script>

<template>
  <!-- 来自中心消息文件的键 -->
  <h1>{{ t('nav.home') }}</h1>
  <!-- 或内联，用于一次性文本 -->
  <p>{{ localize({ en: 'Hello', zh: '你好' }) }} — {{ locale }}</p>
</template>
```

## 按页面授权（`auth`）

基于当前用户对单个页面进行门控。为任意 `NavItem` 或 `StandalonePage` 添加 `auth` 规则，
并在 `SiteConfig` 中提供单一的 `auth.authorize` 策略来决定访问权限。

```typescript
import { defineConfig } from '@bndynet/vue-site'

export default defineConfig({
  title: 'My Site',
  auth: {
    loginPath: '/login',
    authorize: ({ rule }) => {
      const user = getCurrentUser() // 你自己的认证状态
      if (!user) return '/login' // 未登录 -> 重定向（字符串）
      if (rule === true) return true // `auth: true` -> 任意已登录用户
      if (typeof rule === 'string') return user.roles.includes(rule)
      if (Array.isArray(rule)) return rule.some((r) => user.roles.includes(r))
      return true
    },
  },
  nav: [
    { label: 'Home', icon: 'home', page: () => import('../README.md?raw') },
    { label: 'Dashboard', icon: 'gauge', auth: true, page: () => import('./pages/Dash.vue') },
    { label: 'Admin', icon: 'shield', auth: ['admin'], page: () => import('./pages/Admin.vue') },
  ],
  pages: [
    { path: '/login', page: () => import('./pages/Login.vue') }, // 无 `auth` -> 始终可访问
  ],
})
```

### 工作原理

- `authorize` 在**每次导航时**运行（一个 Vue Router `beforeEach` 守卫）。它接收 `{ rule, item, to, from }`，
  并返回 `true`（允许）、`false`（拒绝）或一个路径 `string`（重定向，例如到登录页）。
- 返回 `false` 时，用户会被发送到 `auth.loginPath`，并把请求的路径作为 `redirect` 查询参数
  （`/login?redirect=/admin`）；如果未设置 `loginPath`，则取消该次导航。
- `authorize` 也会在 auth 过滤后的导航菜单刷新时运行（仅带 `rule` / `item`），以从导航菜单中隐藏未授权的条目。
  框架会在导航完成后刷新此菜单；如果你在没有导航的情况下改变登录状态，请调用
  `useSiteConfig().refreshAuthNav()`。
- 受保护的路由仍保持**注册**，因此直接访问受保护 URL 会触发守卫（及你的登录重定向），
  而不是静默地 404。
- 登录页本身**不能**携带 `auth` 规则（且 `loginPath` 始终被守卫允许），以避免重定向循环。

### `AuthConfig`

| 属性 | 说明 |
|----------|-------------|
| `authorize` | `(ctx: AuthContext) => boolean \| string \| Promise<boolean \| string>`。`true` 允许，`false` 拒绝，`string` 重定向。 |
| `loginPath` | 将被拒绝的用户发送到何处（带 `?redirect=`）。可选；不设置时，拒绝将取消导航。 |

`AuthRule` 为 `boolean \| string \| string[] \| ((ctx: AuthContext) => boolean \| Promise<boolean>)`。
框架从不检查规则；它会将规则转发给 `authorize`，因此其含义完全由你决定。

### `visible` 与 `auth` 对比

| | `visible` | `auth` |
|--|-----------|--------|
| 决定 | 条目/路由是否**存在** | **当前用户**是否可以进入 |
| 时机 | 构建/启动（一次） | 导航（每次）+ 刷新时的菜单过滤 |
| 路由是否注册 | 否（无法通过 URL 访问） | 是（受守卫保护；可重定向到登录） |
| 对登录/登出的响应 | 否 | 守卫：是；菜单过滤：导航后或 `refreshAuthNav()` 后是 |
| 最适合 | 环境 / 功能开关 / 静态裁剪 | 登录状态、角色、登录重定向 |

用 `visible` 进行静态存在性裁剪，用 `auth` 进行基于用户的访问控制。它们可以组合在同一个条目上。

## 路由历史（`router`）

默认情况下路由使用 **hash** 历史模式（`#/path`），它无需任何服务器配置即可在任意静态主机上工作，
且与公共 base 无关。要获得干净的 URL，请切换到 HTML5 历史模式：

```typescript
export default defineConfig({
  title: 'My Site',
  router: { mode: 'web' }, // /app/admin 而不是 /app/#/admin
  nav: [/* ... */],
})
```

### `RouterConfig`

| 属性 | 默认值 | 说明 |
|----------|---------|-------------|
| `mode` | `hash` | `hash`（`#/path`，无需服务器配置）或 `web`（HTML5 干净 URL） |
| `base` | `import.meta.env.BASE_URL` | `web` 模式的 base 路径。CLI 会自动从 `--base` / `env.vite.base` 设置它；仅当从自定义入口调用 `createSiteApp` 时才需要覆盖。 |

注意：

- **`web` 模式需要 SPA 回退**：请配置你的主机为未知路径提供 `index.html`，否则深链接 / 刷新会 404。
  Hash 模式无需任何配置。
- **子路径部署**：使用 CLI 时，`--base=/app/` 会在 `web` 模式下被自动用作历史 base。
  在[库模式](#库模式)下，请从你自己的入口传入 `router: { mode: 'web', base: import.meta.env.BASE_URL }`。

## `env`（`SiteEnvConfig`）

| 属性 | 说明 |
|----------|-------------|
| `port` | 开发服务器端口 |
| `outDir` | 构建输出（相对于站点根目录；默认 `{folder}-dist`） |
| `customElements` | 自定义元素的标签前缀（如 `['chat-', 'i-']`） |
| `watchPackages` | 本地包 —— 参见 [env.watchPackages](#envwatchpackages) |
| `vite` | Vite 覆盖配置（不含 `root`）；框架会合并别名、`server.fs.allow`、`build.outDir` 等 |

### `env.watchPackages`

- **字符串** —— 仅包名（如工作区软链接 / `npm link`）。会跳过依赖预打包；文件监听遵循 Vite 默认行为。
- **`{ name, entryPath }`** —— `name` 必须匹配导入说明符（如 `@scope/pkg`）。`entryPath` **相对于
  你运行 CLI 的目录**（包含 `site.config.*` 的文件夹）。Vite 会将该包解析为你的**源码入口**以支持开发 HMR，
  并将包目录加入 `server.fs.allow`。
- 如果你将 **`env.vite.resolve.alias` 用作数组**（`{ find, replacement }[]`），CLI 仍会正确合并
  `watchPackages` 的别名（仅对象展开会破坏这一点）。
- 如果某个包列在此处，**不要**在 `site.config.ts` 中再为同一个包添加**顶层值导入** —— 配置预加载在
  Node 中运行并会解析到 `node_modules`，而应用使用的是 Vite。请改用 **`configureApp` + 动态 `import()`**
  （见下一节）。

### 在 `configureApp` 中使用本地包

`configureApp` 可以是 **`async`** 的，因此你可以在路由安装之后 `await import('your-package')`。
该动态导入在浏览器中、在 Vite 下运行，因此它遵循 `watchPackages`，且不会在 CLI 配置加载期间运行。

```typescript
export default defineConfig({
  env: {
    watchPackages: [{ name: '@acme/widgets', entryPath: '../widgets/src/index.ts' }],
  },
  async configureApp(app) {
    const w = await import('@acme/widgets')
    w.register(app)
  },
})
```

### 开发服务器文件系统访问

CLI 允许 `server.fs` 读取站点根目录下、已安装的 `vue-site` 包目录、站点根目录的**父目录**
（用于 `../…` 导入），以及 —— 当不会扩展到文件系统根目录时 —— **祖父目录**（在 monorepo 中常见，
如 `../../packages/...`）。如有需要，可通过 `env.vite.server.fs.allow` 添加更多路径。
带 `{ entryPath }` 的 `watchPackages` 条目也会为这些包树扩展 `fs.allow`。

## 库模式

拥有自己的 `index.html` + Vite 配置：

```typescript
import { createSiteApp } from '@bndynet/vue-site'
import '@bndynet/vue-site/style.css'
import config from './site.config'

const app = await createSiteApp(config)
app.mount('#app')
```

在你的入口中使用顶层 `await`（或一个 async IIFE）：`createSiteApp` 是异步的，当 `configureApp`
返回 `Promise` 时会 **await** 它。如果你在配置中设置了可选的 `bootstrap`，该模块会在应用创建前加载；
如果省略 `bootstrap`，则跳过该步骤。

导出：`createSiteApp`、`defineConfig`、`useTheme`、`useSiteConfig`、`useLocale`、`useLocalize`、`tk`、`resolveLocalized`、`resolveField`、`resolveMessage`、`mergeCatalog`、`flattenMessages`、`isMessageRef`、`localizedPage`、`builtinMessages`、`themeRefKey`、`localeRefKey`。类型：`SiteConfig`、`SiteEnvConfig`、`SiteViteConfig`、`SiteExternalLink`、`NavItem`、`StandalonePage`、`PageLayout`、`AuthRule`、`AuthContext`、`AuthConfig`、`RouterConfig`、`ThemeConfig`、`ThemeOption`、`ThemePaletteVars`、`ResolvedNavItem`、`I18nConfig`、`LocaleOption`、`LocaleCode`、`LocalizedString`、`MessageRef`、`MessageTree`、`MessageCatalog`、`PageLoader`、`LocalizedPageOptions`。

### 在 Vue 页面中使用主题（`useTheme`）

从 `@bndynet/vue-site` 导入 `useTheme`。它返回一个响应式的 `theme` ref（当前激活的主题 id，
如 `light`、`dark` 或某个 `extraThemes[].id`），外加 `setTheme` 和 `toggleTheme`。
根布局还会在 `document.documentElement` 上设置 `data-theme` 属性并应用 CSS 变量，
因此你可以用 `var(--color-*)` 来设置样式，无需 JavaScript。

theme ref 由 `createSiteApp()` **提供**（与你的应用同一个 Vue 运行时），所以 `watch(theme, …)`
能可靠工作，即使其他工具可能会从嵌套的 `node_modules` 加载第二份 `vue`。

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
  <p>当前主题：{{ theme }}</p>
</template>
```

`watch` 仅在你的组件初始化之后主题**发生变化**时运行（例如用户点击主题控件之后）。
除非你传入 `{ immediate: true }`，否则它不会在初始值上运行。

## 升级

```bash
npm update @bndynet/vue-site
```

## 开发本仓库

```bash
git clone https://github.com/bndynet/vue-site.git && cd vue-site
npm install
npm run dev    # 监听构建 lib + 示例站点
npm run build  # `dist/` + `example/example-dist`
```

### 在其他项目中使用本地构建

已发布的入口指向 `dist/`。在更改 `src/` 下的库**源码**后，需在使用方看到更新之前运行
`npm run build:lib`（或 `build:lib:watch`）。对 **`bin/vue-site.mjs`** 的更改会在下一次运行
`vue-site` 时生效，无需重新构建 lib。

```bash
cd /path/to/vue-site
npm install && npm run build:lib
npm link

cd /path/to/consumer
npm link @bndynet/vue-site
```

编辑文件后无需再次运行 `npm link`；软链接会保持。完成后在使用方运行
`npm unlink @bndynet/vue-site` 和 `npm install`。

## 许可证

MIT
