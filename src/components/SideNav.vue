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
  /* 16px of the button sits on the sidebar; the rest protrudes. */
  --site-sidebar-toggle-inset: 16px;
  left: calc(var(--site-sidebar-current-width) - var(--site-sidebar-toggle-inset));
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 0;
  border-radius: 4px;
  --el-button-size: 28px;
  padding: 0;
  /* Keep the fill identical to the sidebar and draw the ring only on the protruding part,
     so the toggle reads as a tab growing out of the edge. */
  --site-sidebar-toggle-ring: color-mix(in srgb, var(--color-sidebar-bg) 76%, var(--color-sidebar-text) 24%);
  --site-sidebar-toggle-ring-hover: color-mix(in srgb, var(--color-sidebar-bg) 62%, var(--color-sidebar-text) 38%);
  --el-button-text-color: var(--color-sidebar-text);
  /* Keep the sidebar-facing half transparent so a hovered/active nav item behind it
     stays visible. Paint only the protruding half, starting 1px early to cover the
     sidebar's right border at the seam. */
  --el-button-bg-color: transparent;
  --el-button-hover-text-color: var(--color-sidebar-text);
  --el-button-hover-bg-color: transparent;
  --el-button-active-bg-color: transparent;
  background: linear-gradient(
    to right,
    transparent 0 calc(var(--site-sidebar-toggle-inset) - 1px),
    var(--color-sidebar-bg) calc(var(--site-sidebar-toggle-inset) - 1px)
  );
  cursor: pointer;
  transform: translateY(-50%);
  transition: left 0.2s ease;
}

.site-sidebar-collapse-toggle::after {
  content: '';
  position: absolute;
  inset: 0;
  border: 1px solid var(--site-sidebar-toggle-ring);
  border-radius: inherit;
  clip-path: inset(0 0 0 var(--site-sidebar-toggle-inset));
  pointer-events: none;
  transition: border-color 0.15s ease;
}

.site-sidebar-collapse-toggle:hover::after {
  border-color: var(--site-sidebar-toggle-ring-hover);
}

/* Nudge the chevron toward the protruding half instead of the sidebar edge. */
.site-sidebar-collapse-toggle svg {
  transform: translateX(6px);
}

/* Keyboard focus follows the protruding tab instead of outlining the merged half. */
.site-sidebar-collapse-toggle:focus-visible {
  outline: none;
}

.site-sidebar-collapse-toggle:focus-visible::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  outline: 2px solid var(--color-link);
  outline-offset: 0;
  /* Leave room for the outline above/right/below, but keep the open edge on the sidebar. */
  clip-path: inset(-4px -4px -4px var(--site-sidebar-toggle-inset));
  pointer-events: none;
  z-index: 1;
}

/* Mobile breakpoint — keep in sync with MOBILE_BREAKPOINT_PX (src/composables/useMobileViewport.ts). */
@media (max-width: 840px) {
  .site-sidebar-collapse-toggle {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .site-sidebar-collapse-toggle,
  .site-sidebar-collapse-toggle::after {
    transition: none;
  }
}
</style>
