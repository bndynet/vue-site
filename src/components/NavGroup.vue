<script setup lang="ts">
import { ref, computed, watch, nextTick, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import type { ResolvedNavItem } from '../types'
import { subtreeContainsPath } from '../nav-utils'
import { useLocalize } from '../composables/useLocalize'
import DynamicIcon from './DynamicIcon.vue'
import NavLink from './NavItem.vue'
import NavGroupRecursive from './NavGroup.vue'

const props = withDefaults(defineProps<{
  item: ResolvedNavItem
  collapsed?: boolean
  hoverExpand?: boolean
}>(), {
  collapsed: false,
  hoverExpand: false,
})

const route = useRoute()
const { localize } = useLocalize()

const hasActiveChild = computed(() => {
  return props.item.resolvedChildren?.some((child) =>
    subtreeContainsPath(child, route.path),
  ) ?? false
})

const expanded = ref(hasActiveChild.value)
const popupOpen = ref(false)
const trigger = ref<HTMLButtonElement | null>(null)
const popup = ref<HTMLElement | null>(null)
const popupPosition = ref({ top: 0, left: 0 })
let closeTimer: ReturnType<typeof setTimeout> | undefined

watch(hasActiveChild, (active) => {
  if (active) expanded.value = true
})

function toggle() {
  expanded.value = !expanded.value
}

async function openPopup() {
  if (!props.collapsed) return
  if (closeTimer) clearTimeout(closeTimer)
  popupOpen.value = true
  await nextTick()
  const triggerRect = trigger.value?.getBoundingClientRect()
  if (!triggerRect) return
  const popupHeight = popup.value?.getBoundingClientRect().height ?? 320
  popupPosition.value = {
    top: Math.max(8, Math.min(triggerRect.top, window.innerHeight - popupHeight - 8)),
    left: triggerRect.right + 6,
  }
}

function schedulePopupClose() {
  if (closeTimer) clearTimeout(closeTimer)
  closeTimer = setTimeout(() => {
    popupOpen.value = false
  }, 120)
}

function keepPopupOpen() {
  if (closeTimer) clearTimeout(closeTimer)
}

watch(() => route.fullPath, () => {
  popupOpen.value = false
})

onBeforeUnmount(() => {
  if (closeTimer) clearTimeout(closeTimer)
})
</script>

<template>
  <div
    class="nav-group"
    :class="{ 'nav-group--expanded': expanded, 'nav-group--collapsed': collapsed }"
    @pointerenter="collapsed ? openPopup() : hoverExpand ? expanded = true : undefined"
    @pointerleave="collapsed ? schedulePopupClose() : hoverExpand ? expanded = false : undefined"
  >
    <button
      ref="trigger"
      class="nav-group-header"
      :title="collapsed ? localize(item.label) : undefined"
      :aria-label="collapsed ? localize(item.label) : undefined"
      :aria-expanded="collapsed ? popupOpen : expanded"
      @focus="collapsed ? openPopup() : undefined"
      @click="collapsed ? openPopup() : hoverExpand ? expanded = true : toggle()"
    >
      <DynamicIcon v-if="item.icon" :name="item.icon" :size="18" />
      <span v-else-if="collapsed" class="nav-group-fallback" aria-hidden="true">{{ localize(item.label).slice(0, 1) }}</span>
      <span class="nav-group-label">{{ localize(item.label) }}</span>
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
    <div v-if="!collapsed" v-show="expanded" class="nav-group-children">
      <template v-for="child in item.resolvedChildren" :key="child.resolvedPath">
        <NavGroupRecursive v-if="child.isGroup" :item="child" :hover-expand="hoverExpand" />
        <NavLink v-else :item="child" :indent="true" />
      </template>
    </div>
    <Teleport to="body">
      <div
        v-if="collapsed && popupOpen"
        ref="popup"
        class="nav-group-popup"
        :style="{ top: `${popupPosition.top}px`, left: `${popupPosition.left}px` }"
        @pointerenter="keepPopupOpen"
        @pointerleave="schedulePopupClose"
      >
        <div class="nav-group-popup-title">{{ localize(item.label) }}</div>
        <template v-for="child in item.resolvedChildren" :key="child.resolvedPath">
          <NavGroupRecursive v-if="child.isGroup" :item="child" :hover-expand="true" />
          <NavLink v-else :item="child" />
        </template>
      </div>
    </Teleport>
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

.nav-group--collapsed .nav-group-header {
  justify-content: center;
  gap: 0;
  padding: 10px 0;
}

.nav-group--collapsed .nav-group-label,
.nav-group--collapsed .nav-group-chevron {
  display: none;
}

.nav-group-fallback {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  font-size: 0.8rem;
  font-weight: 700;
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

.nav-group-popup {
  position: fixed;
  z-index: 100;
  width: 240px;
  max-height: min(70vh, 520px);
  overflow: auto;
  padding: 8px;
  border: 1px solid var(--color-sidebar-border);
  border-radius: 10px;
  background: var(--color-sidebar-bg);
  box-shadow: 0 12px 32px rgb(0 0 0 / 18%);
}

.nav-group-popup-title {
  padding: 8px 12px;
  color: var(--color-sidebar-title);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.nav-group-popup :deep(.nav-group-popup) {
  position: static;
  width: auto;
  max-height: none;
  overflow: visible;
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}

.nav-group-popup :deep(.nav-item),
.nav-group-popup :deep(.nav-group-header) {
  width: 100%;
  box-sizing: border-box;
}
</style>
