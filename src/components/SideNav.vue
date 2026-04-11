<script setup lang="ts">
import { useNavLayout } from '../composables/useNavLayout'
import NavItem from './NavItem.vue'
import NavGroup from './NavGroup.vue'

const { sidebarNav } = useNavLayout()
</script>

<template>
  <nav class="site-sidebar-nav">
    <template v-for="item in sidebarNav" :key="item.resolvedPath">
      <NavGroup v-if="item.isGroup" :item="item" />
      <NavItem v-else :item="item" />
    </template>
  </nav>
</template>
