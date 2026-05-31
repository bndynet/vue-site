# 快速开始

```bash
npm install @bndynet/vue-site
```

```typescript
import { defineConfig } from '@bndynet/vue-site'

export default defineConfig({
  title: '我的站点',
  nav: [{ label: '首页', icon: 'home', page: () => import('./README.md?raw') }],
})
```

```bash
npx vue-site dev
```

完整说明见根目录 [README.md](https://github.com/bndynet/vue-site/blob/main/README.md)。
