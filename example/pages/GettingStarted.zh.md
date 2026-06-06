# 快速开始

```bash
npm install @bndynet/vue-site
```

```typescript
import { defineConfig } from '@bndynet/vue-site'

export default defineConfig({
  title: '我的站点',
  nav: [
    // 把 `page` 指向一个文件路径即可。
    { label: '首页', icon: 'home', page: './README.md' },
  ],
})
```

```bash
npx vue-site dev
```

## 多语言（可选）

想要某个页面的翻译版本？只需在基础文件旁边放一个 `名.<code>` 文件 —— 无需改配置：

```
README.md       # 基础 / 回退
README.zh.md    # 当前语言为 `zh` 时使用
```

框架会按语言自动加载对应文件，找不到时回退到基础文件。Vue 页面同理（`About.vue` + `About.zh.vue`）。

完整说明见根目录 [README.md](https://github.com/bndynet/vue-site/blob/main/README.md)。
