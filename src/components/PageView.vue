<script setup lang="ts">
import { ref, shallowRef, watch, onMounted, type Component } from 'vue'
import { useRoute } from 'vue-router'
import type { ResolvedNavItem } from '../types'
import { useSiteConfig } from '../composables/useSiteConfig'
import { useLocalize } from '../composables/useLocalize'
import MarkdownView from './MarkdownView.vue'

const route = useRoute()
const { config } = useSiteConfig()
const { localize, locale, t } = useLocalize()
const markdownContent = ref('')
const vueComponent = shallowRef<Component | null>(null)
const loading = ref(true)

async function loadContent() {
  loading.value = true
  markdownContent.value = ''
  vueComponent.value = null

  const navItem = route.meta.navItem as ResolvedNavItem | undefined

  if (!navItem) {
    markdownContent.value = `# ${t('page.notFound')}`
    loading.value = false
    return
  }

  try {
    if (navItem.page) {
      const mod = await navItem.page(locale.value)
      if (typeof mod.default === 'string') {
        markdownContent.value = mod.default
      } else {
        vueComponent.value = mod.default as Component
      }
    } else if (navItem.isHome && config.readme) {
      markdownContent.value = config.readme
    } else {
      markdownContent.value = `# ${localize(navItem.label)}`
    }
  } catch {
    markdownContent.value = `# ${t('page.loadErrorTitle')}\n\n${t('page.loadErrorBody', { label: localize(navItem.label) })}`
  }

  loading.value = false
}

onMounted(loadContent)
watch([() => route.path, locale], loadContent)
</script>

<template>
  <div class="page-view">
    <div v-if="loading" class="page-loading">
      <span class="page-loading-dot" />
    </div>
    <component v-else-if="vueComponent" :is="vueComponent" />
    <MarkdownView v-else :content="markdownContent" />
  </div>
</template>

<style scoped>
.page-view {
  min-height: 200px;
}

.page-loading {
  display: flex;
  justify-content: center;
  padding: 60px 0;
}

.page-loading-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-link);
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1); }
}
</style>
