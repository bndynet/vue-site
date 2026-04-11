# Getting Started

```bash
npm install @bndynet/vue-site
```

```typescript
import { defineConfig } from '@bndynet/vue-site'

export default defineConfig({
  title: 'My Site',
  nav: [{ label: 'Home', icon: 'home', page: () => import('./README.md?raw') }],
})
```

```bash
npx vue-site dev
```

Full walkthrough: root [README.md](https://github.com/bndynet/vue-site/blob/main/README.md).
