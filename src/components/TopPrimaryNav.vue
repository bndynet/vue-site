<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useSiteConfig } from '../composables/useSiteConfig'
import { getFirstLeafPath, subtreeContainsPath } from '../nav-utils'
import DynamicIcon from './DynamicIcon.vue'

const { resolvedNav } = useSiteConfig()
const route = useRoute()

const links = computed(() =>
  resolvedNav.map((item) => ({
    item,
    to: item.isGroup ? getFirstLeafPath(item) ?? '/' : item.resolvedPath,
    active: subtreeContainsPath(item, route.path),
  })),
)
</script>

<template>
  <nav class="site-primary-nav-links" aria-label="Primary">
    <router-link
      v-for="{ item, to, active } in links"
      :key="item.resolvedPath + item.label"
      :to="to"
      class="site-primary-nav-link"
      :class="{ 'site-primary-nav-link--active': active }"
    >
      <DynamicIcon v-if="item.icon" :name="item.icon" :size="17" />
      <span class="site-primary-nav-link-label">{{ item.label }}</span>
    </router-link>
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
