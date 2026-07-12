# 配置

在 `site.config.ts` 中使用 `defineConfig({ ... })`。完整字段表与 `env` / `theme` 细节见根目录 [README.md](https://github.com/bndynet/vue-site/blob/main/README.md)。

**常用字段：** `title`、`nav`（`label`、`icon`、`page`、`layout`、`children`、`link`、`visible`）、`pages`、`favicon`、`logo`、`theme`、`footer`、`links`、`custom`、`env`（`port`、`outDir`、`vite` 等）。

**`custom`** —— 框架原样保留的公开业务配置，可通过 `useSiteConfig().config.custom` 读取。可用不同的配置文件设置本地、生产等环境的 API 基础地址。这些值会进入客户端代码，不能存放密钥。

**`nav[].page`** —— 页面内容。最简单的是一个**文件路径字符串**，如 `'./pages/About.vue'` 或 `'./README.md'`：框架会加载它，并在多语言站点中自动使用同名的 `名.<code>` 文件（如 `README.zh.md`），找不到时回退到基础文件。如果不需要这种行为，也可以传入一个加载器（`() => import('./About.vue')`）。详见根目录 README 的「高级页面加载器」。

**`nav[].visible`** —— 可选的 `() => boolean | Promise<boolean>`，在启动时执行一次。返回 `false` 可将该项从导航中隐藏并跳过其路由注册（因此无法通过直接访问 URL 打开）。常用于静态环境或功能开关入口，例如 `visible: () => import.meta.env.DEV`。被隐藏的父级会隐藏其整个子树，子项全部隐藏的分组会被裁剪。它只在启动时求值；登录或角色权限请使用 `auth`。

**`nav[].layout`** —— 可选的页面宽度模式：`'default'` 保持标准居中阅读宽度，`'wide'` 使用更宽的居中画布，`'full'` 以无框架内边距的方式填满可用父容器。适合给 dashboard 这类应用型页面使用 `'full'`。

**`pages`** —— 注册在 `nav` 树之外的独立全屏页面。它们不出现在任何导航中，渲染时没有顶栏、侧栏或页脚（仅内容）；当前主题仍通过根 CSS 变量生效。每一项为 `{ path, page }`，例如 `{ path: '/landing', page: './pages/Landing.vue' }`（`page` 与 `nav[].page` 接受相同的形式）。
