<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref } from 'vue'
import { useSiteConfig } from '../composables/useSiteConfig'
import { useLocalize } from '../composables/useLocalize'
import { useSidebarState } from '../composables/useSidebarState'
import type { LocalizedString } from '../types'
import DynamicIcon from './DynamicIcon.vue'
import UiTooltip from './UiTooltip.vue'

const props = withDefaults(
  defineProps<{
    /** Smaller hit targets for sidebar footer */
    compact?: boolean
  }>(),
  { compact: false },
)

const { config } = useSiteConfig()
const { localize } = useLocalize()
const { collapsed } = useSidebarState()
const isCollapsed = computed(() => props.compact && collapsed.value)
const trigger = ref<HTMLButtonElement | null>(null)
const popup = ref<HTMLElement | null>(null)
const popupOpen = ref(false)
const popupPosition = ref({ top: 0, left: 0 })
let closeTimer: ReturnType<typeof setTimeout> | undefined

async function openPopup() {
  if (!isCollapsed.value) return
  if (closeTimer) clearTimeout(closeTimer)
  popupOpen.value = true
  await nextTick()
  const triggerRect = trigger.value?.getBoundingClientRect()
  if (!triggerRect) return
  const popupHeight = popup.value?.getBoundingClientRect().height ?? 160
  popupPosition.value = {
    top: Math.max(8, Math.min(triggerRect.top, window.innerHeight - popupHeight - 8)),
    left: triggerRect.right,
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

onBeforeUnmount(() => {
  if (closeTimer) clearTimeout(closeTimer)
})

function linkTooltip(item: { link: string; title?: LocalizedString }): string {
  const t = localize(item.title).trim()
  if (t) return t
  try {
    const u = new URL(item.link)
    return u.hostname.replace(/^www\./, '')
  } catch {
    return item.link
  }
}

const items = computed(() => {
  const fromConfig = config.links ?? []
  const seen = new Set(fromConfig.map((l) => l.link))
  const out = [...fromConfig]
  const repo = config.packageRepository
  if (repo && !seen.has(repo)) {
    out.push({ icon: 'github', link: repo, title: 'GitHub' })
  }
  return out
})
</script>

<template>
  <div
    v-if="items.length"
    class="site-external-links"
    :class="{
      'site-external-links--compact': props.compact,
      'site-external-links--collapsed': isCollapsed,
    }"
    @pointerenter="isCollapsed ? openPopup() : undefined"
    @pointerleave="isCollapsed ? schedulePopupClose() : undefined"
  >
    <button
      v-if="isCollapsed"
      ref="trigger"
      type="button"
      class="site-external-link site-icon-action site-external-links-trigger"
      :aria-label="localize({ en: 'External links', zh: '外部链接' })"
      :aria-expanded="popupOpen"
      @focus="openPopup"
      @click="openPopup"
    >
      <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="5" cy="12" r="1.8" />
        <circle cx="12" cy="12" r="1.8" />
        <circle cx="19" cy="12" r="1.8" />
      </svg>
    </button>
    <template v-else>
      <UiTooltip
        v-for="(item, i) in items"
        :key="`${item.link}-${i}`"
        :label="linkTooltip(item)"
        :placement="props.compact ? 'top' : 'bottom'"
        #="{ describedBy }"
      >
        <a
          class="site-external-link site-icon-action"
          :href="item.link"
          target="_blank"
          rel="noopener noreferrer"
          :aria-describedby="describedBy"
          :aria-label="linkTooltip(item)"
        >
          <DynamicIcon :name="item.icon" :size="props.compact ? 15 : 18" />
        </a>
      </UiTooltip>
    </template>
    <Teleport to="body">
      <div
        v-if="isCollapsed && popupOpen"
        ref="popup"
        class="site-external-links-popup"
        role="group"
        :aria-label="localize({ en: 'External links', zh: '外部链接' })"
        :style="{ top: `${popupPosition.top}px`, left: `${popupPosition.left}px` }"
        @pointerenter="keepPopupOpen"
        @pointerleave="schedulePopupClose"
      >
        <UiTooltip
          v-for="(item, i) in items"
          :key="`${item.link}-${i}`"
          :label="linkTooltip(item)"
          placement="top"
          #="{ describedBy }"
        >
          <a
            class="site-external-link site-icon-action"
            :href="item.link"
            target="_blank"
            rel="noopener noreferrer"
            :aria-describedby="describedBy"
            :aria-label="linkTooltip(item)"
          >
            <DynamicIcon :name="item.icon" :size="15" />
          </a>
        </UiTooltip>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.site-external-links {
  display: flex;
  align-items: center;
  gap: var(--site-icon-action-gap);
}

.site-external-links--collapsed {
  justify-content: center;
}

.site-external-links-trigger {
  appearance: none;
}

.site-external-links-popup {
  position: fixed;
  z-index: 1000;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  width: max-content;
  max-width: min(240px, calc(100vw - 76px));
  padding: 4px;
  background: var(--color-sidebar-bg);
  border: 1px solid var(--color-sidebar-border);
  border-radius: 10px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.16);
}

</style>
