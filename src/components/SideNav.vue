<script setup lang="ts">
import { computed } from 'vue'
import { ElButton } from 'element-plus'
import 'element-plus/es/components/button/style/css'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import type { ResolvedNavItem } from '../types'
import { useNavLayout } from '../composables/useNavLayout'
import { useLocalize } from '../composables/useLocalize'
import NavItem from './NavItem.vue'
import NavGroup from './NavGroup.vue'

const props = defineProps<{
  /** Optional navigation tree override, used by the mobile drawer. */
  items?: ResolvedNavItem[]
  /** Whether desktop navigation is shown as an icon rail. */
  collapsed?: boolean
}>()

const emit = defineEmits<{
  'toggle-collapse': []
}>()

const { sidebarNav } = useNavLayout()
const { localize } = useLocalize()
const navItems = computed(() => props.items ?? sidebarNav.value)
</script>

<template>
  <nav class="site-sidebar-nav">
    <ElButton
      v-if="!items"
      class="site-sidebar-collapse-toggle"
      native-type="button"
      circle
      :aria-label="localize(collapsed
        ? { en: 'Expand sidebar', zh: '展开侧边栏' }
        : { en: 'Collapse sidebar', zh: '收起侧边栏' })"
      :aria-expanded="!collapsed"
      @click="emit('toggle-collapse')"
    >
      <ChevronRight v-if="collapsed" :size="16" :stroke-width="1.8" aria-hidden="true" />
      <ChevronLeft v-else :size="16" :stroke-width="1.8" aria-hidden="true" />
    </ElButton>
    <template v-for="item in navItems" :key="item.resolvedPath">
      <NavGroup v-if="item.isGroup" :item="item" :collapsed="collapsed" />
      <NavItem v-else :item="item" :collapsed="collapsed" />
    </template>
  </nav>
</template>

<style scoped>
.site-sidebar-collapse-toggle {
  position: fixed;
  z-index: 15;
  top: 50vh;
  left: calc(var(--site-sidebar-current-width) - 16px);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  --el-button-size: 28px;
  padding: 0;
  --el-button-text-color: var(--color-sidebar-text);
  --el-button-bg-color: var(--color-sidebar-bg);
  --el-button-border-color: var(--color-sidebar-border);
  --el-button-hover-text-color: var(--color-sidebar-text);
  --el-button-hover-bg-color: color-mix(in srgb, var(--color-sidebar-bg) 90%, var(--color-sidebar-text) 10%);
  --el-button-hover-border-color: var(--color-sidebar-border);
  cursor: pointer;
  box-shadow: 0 2px 8px rgb(0 0 0 / 12%);
  transform: translateY(-50%);
  transition: left 0.2s ease, box-shadow 0.15s ease;
}

.site-sidebar-collapse-toggle:hover {
  box-shadow: 0 3px 12px rgb(0 0 0 / 18%);
}

.site-sidebar-collapse-toggle:focus-visible {
  outline: 2px solid var(--color-link);
  outline-offset: 2px;
}

/* Mobile breakpoint — keep in sync with MOBILE_BREAKPOINT_PX (src/composables/useMobileViewport.ts). */
@media (max-width: 840px) {
  .site-sidebar-collapse-toggle {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .site-sidebar-collapse-toggle {
    transition: none;
  }
}
</style>
