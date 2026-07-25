<script setup lang="ts">
import { computed } from 'vue'
import type { ResolvedNavItem } from '../types'
import { useNavLayout } from '../composables/useNavLayout'
import NavItem from './NavItem.vue'
import NavGroup from './NavGroup.vue'

const props = defineProps<{
  /** Optional navigation tree override, used by the mobile drawer. */
  items?: ResolvedNavItem[]
}>()

const { sidebarNav } = useNavLayout()
const navItems = computed(() => props.items ?? sidebarNav.value)
</script>

<template>
  <nav class="site-sidebar-nav">
    <template v-for="item in navItems" :key="item.resolvedPath">
      <NavGroup v-if="item.isGroup" :item="item" />
      <NavItem v-else :item="item" />
    </template>
  </nav>
</template>
