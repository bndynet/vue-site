# 配置

在 `site.config.ts` 中使用 `defineConfig({ ... })`。完整字段表与 `env` / `theme` 细节见根目录 [README.md](https://github.com/bndynet/vue-site/blob/main/README.md)。

**常用字段：** `title`、`nav`（`label`、`icon`、`page`、`children`、`link`、`visible`）、`pages`、`logo`、`theme`、`footer`、`links`、`env`（`port`、`outDir`、`vite` 等）。

**`nav[].visible`** —— 可选的 `() => boolean | Promise<boolean>`，在启动时执行一次。返回 `false` 可将该项从导航中隐藏并跳过其路由注册（因此无法通过直接访问 URL 打开）。常用于权限控制的入口，例如 `visible: () => localStorage.getItem('isAdmin') === '1'`。被隐藏的父级会隐藏其整个子树，子项全部隐藏的分组会被裁剪。它只在启动时求值，因此在不重建应用的情况下不会响应后续的权限变化（登录/登出）。

**`pages`** —— 注册在 `nav` 树之外的独立全屏页面。它们不出现在任何导航中，渲染时没有顶栏、侧栏或页脚（仅内容）；当前主题仍通过根 CSS 变量生效。每一项为 `{ path, page }`，例如 `{ path: '/landing', page: () => import('./pages/Landing.vue') }`。
