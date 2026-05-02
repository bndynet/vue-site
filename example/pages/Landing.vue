<script setup lang="ts">
import { useTheme } from '@bndynet/vue-site'

const { theme } = useTheme()
</script>

<template>
  <div class="landing">
    <div class="landing-card">
      <h1 class="landing-title">Standalone Page</h1>
      <p class="landing-subtitle">
        This page is registered via <code>pages</code>, not <code>nav</code>. It renders with no top
        bar, sidebar, or footer — just full-screen content.
      </p>
      <p class="landing-theme">
        Active theme (still applied via root CSS variables):
        <code>{{ theme }}</code>
      </p>
      <router-link to="/" class="landing-link">← Back to the site</router-link>
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
