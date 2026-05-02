<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import type { ResolvedNavItem } from '../types'
import { isExternalLink } from '../nav-utils'
import DynamicIcon from './DynamicIcon.vue'

const props = withDefaults(defineProps<{
  item: ResolvedNavItem
  indent?: boolean
}>(), {
  indent: false,
})

const route = useRoute()

const isExternal = computed(() => !!props.item.link && isExternalLink(props.item.link))
const target = computed(() => props.item.link ?? props.item.resolvedPath)
const isActive = computed(() => !isExternal.value && route.path === target.value)
</script>

<template>
  <a
    v-if="isExternal"
    :href="item.link"
    class="nav-item"
    :class="{ 'nav-item--indent': indent }"
    target="_blank"
    rel="noopener noreferrer"
  >
    <DynamicIcon v-if="item.icon" :name="item.icon" :size="18" />
    <span class="nav-item-label">{{ item.label }}</span>
  </a>
  <router-link
    v-else
    :to="target"
    class="nav-item"
    :class="{ 'nav-item--active': isActive, 'nav-item--indent': indent }"
  >
    <DynamicIcon v-if="item.icon" :name="item.icon" :size="18" />
    <span class="nav-item-label">{{ item.label }}</span>
  </router-link>
</template>

<style scoped>
.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 14px;
  margin-bottom: 2px;
  border-radius: 8px;
  color: var(--color-sidebar-text);
  font-size: 0.9rem;
  font-weight: 500;
  text-decoration: none;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.nav-item--indent {
  padding-left: 22px;
  font-size: 0.85rem;
}

.nav-item:hover {
  background: var(--color-sidebar-item-hover);
  text-decoration: none;
}

.nav-item--active {
  background: var(--color-sidebar-item-active);
  color: var(--color-sidebar-item-active-text);
}

.nav-item-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
