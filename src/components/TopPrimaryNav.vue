<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useSiteConfig } from '../composables/useSiteConfig'
import { getFirstLeafPath, subtreeContainsPath, isExternalLink } from '../nav-utils'
import { useLocalize } from '../composables/useLocalize'
import DynamicIcon from './DynamicIcon.vue'

const { resolvedNav } = useSiteConfig()
const route = useRoute()
const { localize } = useLocalize()

const links = computed(() =>
  resolvedNav.map((item) => {
    const external = !!item.link && isExternalLink(item.link)
    const to = item.link ?? (item.isGroup ? getFirstLeafPath(item) ?? '/' : item.resolvedPath)
    const active = external
      ? false
      : item.link
        ? route.path === item.link
        : subtreeContainsPath(item, route.path)
    return { item, to, external, active }
  }),
)
</script>

<template>
  <nav class="site-primary-nav-links" aria-label="Primary">
    <template v-for="{ item, to, external, active } in links" :key="item.resolvedPath">
      <a
        v-if="external"
        :href="item.link"
        class="site-primary-nav-link"
        target="_blank"
        rel="noopener noreferrer"
      >
        <DynamicIcon v-if="item.icon" :name="item.icon" :size="17" />
        <span class="site-primary-nav-link-label">{{ localize(item.label) }}</span>
      </a>
      <router-link
        v-else
        :to="to"
        class="site-primary-nav-link"
        :class="{ 'site-primary-nav-link--active': active }"
      >
        <DynamicIcon v-if="item.icon" :name="item.icon" :size="17" />
        <span class="site-primary-nav-link-label">{{ localize(item.label) }}</span>
      </router-link>
    </template>
  </nav>
</template>

<style scoped>
.site-primary-nav-links {
  display: flex;
  align-items: stretch;
  gap: 0;
  min-width: 0;
  flex: 1;
  overflow-x: auto;
  padding: 0;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
}

.site-primary-nav-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  padding: 0 14px;
  border-radius: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-sidebar-text);
  text-decoration: none;
  background: transparent;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.site-primary-nav-link:hover {
  background: var(--color-sidebar-item-hover);
  text-decoration: none;
}

.site-primary-nav-link--active {
  background: var(--color-sidebar-item-active);
  color: var(--color-sidebar-item-active-text);
}

.site-primary-nav-link-label {
  white-space: nowrap;
}
</style>
