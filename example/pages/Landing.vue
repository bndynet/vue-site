<script setup lang="ts">
import { useTheme, useLocalize } from '@bndynet/vue-site'

const { theme } = useTheme()
const { localize } = useLocalize()
</script>

<template>
  <div class="landing">
    <div class="landing-card">
      <h1 class="landing-title">{{ localize({ en: 'Standalone Page', zh: '独立页面' }) }}</h1>
      <p class="landing-subtitle">
        {{ localize({ en: 'This page is registered via pages, not nav. It renders with no top bar, sidebar, or footer — just full-screen content.', zh: '本页通过 pages 注册，而非 nav。它渲染时没有顶栏、侧栏或页脚——只有全屏内容。' }) }}
      </p>
      <p class="landing-theme">
        {{ localize({ en: 'Active theme (still applied via root CSS variables):', zh: '当前主题（仍通过根 CSS 变量生效）：' }) }}
        <code>{{ theme }}</code>
      </p>
      <router-link to="/" class="landing-link">{{ localize({ en: '← Back to the site', zh: '← 返回站点' }) }}</router-link>
    </div>
  </div>
</template>

<style scoped>
.landing {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  box-sizing: border-box;
  background: var(--color-bg);
  color: var(--color-text);
}

.landing-card {
  max-width: 560px;
  text-align: center;
}

.landing-title {
  font-size: 2.5rem;
  margin-bottom: 16px;
  color: var(--color-text);
}

.landing-subtitle {
  font-size: 1.05rem;
  line-height: 1.7;
  color: var(--color-text-secondary);
  margin-bottom: 20px;
}

.landing-theme {
  color: var(--color-text-secondary);
  margin-bottom: 28px;
}

.landing code {
  background: var(--color-code-bg);
  color: var(--color-code-text);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.875em;
}

.landing-link {
  display: inline-block;
  color: var(--color-link);
  font-weight: 500;
  text-decoration: none;
}

.landing-link:hover {
  color: var(--color-link-hover);
  text-decoration: underline;
}
</style>
