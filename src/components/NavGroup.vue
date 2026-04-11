<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import type { ResolvedNavItem } from '../types'
import { subtreeContainsPath } from '../nav-utils'
import DynamicIcon from './DynamicIcon.vue'
import NavLink from './NavItem.vue'
import NavGroupRecursive from './NavGroup.vue'

const props = defineProps<{
  item: ResolvedNavItem
}>()

const route = useRoute()

const hasActiveChild = computed(() => {
  return props.item.resolvedChildren?.some((child) =>
    subtreeContainsPath(child, route.path),
  ) ?? false
})

const expanded = ref(hasActiveChild.value)

watch(hasActiveChild, (active) => {
  if (active) expanded.value = true
})

function toggle() {
  expanded.value = !expanded.value
}
</script>

<template>
  <div class="nav-group" :class="{ 'nav-group--expanded': expanded }">
    <button class="nav-group-header" @click="toggle">
      <DynamicIcon v-if="item.icon" :name="item.icon" :size="18" />
      <span class="nav-group-label">{{ item.label }}</span>
      <svg
        class="nav-group-chevron"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="m9 18 6-6-6-6" />
      </svg>
    </button>
    <div v-show="expanded" class="nav-group-children">
      <template v-for="child in item.resolvedChildren" :key="child.resolvedPath + child.label">
        <NavGroupRecursive v-if="child.isGroup" :item="child" />
        <NavLink v-else :item="child" :indent="true" />
      </template>
    </div>
  </div>
</template>

<style scoped>
.nav-group-header {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 9px 14px;
  margin-bottom: 2px;
  border: none;
  border-radius: 8px;
  background: none;
  color: var(--color-sidebar-text);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  text-align: left;
  transition: background-color 0.15s ease;
}

.nav-group-header:hover {
  background: var(--color-sidebar-item-hover);
}

.nav-group-label {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-group-chevron {
  flex-shrink: 0;
  transition: transform 0.2s ease;
  opacity: 0.5;
}

.nav-group--expanded .nav-group-chevron {
  transform: rotate(90deg);
}

.nav-group-children {
  padding-left: 8px;
}
</style>
