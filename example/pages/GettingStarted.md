# Getting Started

```bash
npm install @bndynet/vue-site
```

```typescript
import { defineConfig } from '@bndynet/vue-site'

export default defineConfig({
  title: 'My Site',
  nav: [
    // Point `page` at a file path — that's all you need.
    { label: 'Home', icon: 'home', page: './README.md' },
  ],
})
```

```bash
npx vue-site dev
```

## Multi-language (optional)

Want a translated page? Just drop a `name.<code>` file next to the base file — no config change:

```
README.md       # base / fallback
README.zh.md    # used when the active locale is `zh`
```

The framework auto-loads the right one per locale and falls back to the base file when a language is
missing. The same works for Vue pages (`About.vue` + `About.zh.vue`).

Full walkthrough: root [README.md](https://github.com/bndynet/vue-site/blob/main/README.md).
