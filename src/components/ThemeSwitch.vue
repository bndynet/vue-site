<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useId } from 'vue'
import { useTheme } from '../composables/useTheme'
import { useSiteConfig } from '../composables/useSiteConfig'
import DynamicIcon from './DynamicIcon.vue'
import TooltipOverlay from './TooltipOverlay.vue'
import UiTooltip from './UiTooltip.vue'

const { theme, setTheme } = useTheme()
const { config } = useSiteConfig()

const props = withDefaults(
  defineProps<{
    compact?: boolean
  }>(),
  { compact: false },
)

const detailsRef = ref<HTMLDetailsElement | null>(null)
const summaryRef = ref<HTMLElement | null>(null)

const summaryTipOpen = ref(false)
const summaryTipId = useId()
let summaryTipTimer: ReturnType<typeof setTimeout>

const summaryTipPlacement = computed<'top' | 'bottom'>(() =>
  props.compact ? 'top' : 'bottom',
)

function onSummaryEnter() {
  clearTimeout(summaryTipTimer)
  summaryTipTimer = setTimeout(() => {
    summaryTipOpen.value = true
  }, 200)
}

function onSummaryLeave() {
  clearTimeout(summaryTipTimer)
  summaryTipOpen.value = false
}

onBeforeUnmount(() => {
  clearTimeout(summaryTipTimer)
})

const iconSize = computed(() => (props.compact ? 15 : 18))
const optionTipPlacement = computed<'top' | 'bottom'>(() =>
  props.compact ? 'top' : 'bottom',
)

const themeChoices = computed(() => {
  const base = [
    { id: 'light', label: 'Light', icon: 'sun' as const },
    { id: 'dark', label: 'Dark', icon: 'moon' as const },
  ]
  const extra =
    config.theme?.extraThemes?.map((t) => ({
      id: t.id,
      label: t.label,
      icon: (t.icon ?? 'palette') as string,
    })) ?? []
  return [...base, ...extra]
})

const currentIcon = computed(
  () => themeChoices.value.find((o) => o.id === theme.value)?.icon ?? 'palette',
)

function pick(id: string) {
  setTheme(id)
  if (detailsRef.value) {
    detailsRef.value.open = false
  }
}
</script>

<template>
  <details
    ref="detailsRef"
    class="theme-switch"
    :class="{ 'theme-switch--compact': props.compact }"
  >
    <summary
      ref="summaryRef"
      class="theme-switch-trigger"
      aria-label="Theme"
      :aria-describedby="summaryTipOpen ? summaryTipId : undefined"
      @mouseenter="onSummaryEnter"
      @mouseleave="onSummaryLeave"
    >
      <span class="theme-switch-trigger-icon" aria-hidden="true">
        <DynamicIcon :name="currentIcon" :size="iconSize" />
      </span>
    </summary>
    <div class="theme-switch-menu" role="group" aria-label="Theme options">
      <UiTooltip
        v-for="opt in themeChoices"
        :key="opt.id"
        :label="opt.label"
        :placement="optionTipPlacement"
        #="{ describedBy }"
      >
        <button
          type="button"
          class="theme-switch-option"
          :class="{ 'theme-switch-option--active': opt.id === theme }"
          :aria-describedby="describedBy"
          :aria-label="opt.label"
          :aria-pressed="opt.id === theme"
          @click="pick(opt.id)"
        >
          <DynamicIcon :name="opt.icon" :size="iconSize" />
        </button>
      </UiTooltip>
    </div>
    <TooltipOverlay
      :id="summaryTipId"
      :open="summaryTipOpen"
      text="Theme"
      :anchor="summaryRef"
      :placement="summaryTipPlacement"
    />
  </details>
</template>

<style scoped>
.theme-switch {
  position: relative;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  width: fit-content;
  max-width: 100%;
  color: var(--color-theme-switch-text);
}

.theme-switch summary {
  list-style: none;
}

.theme-switch summary::-webkit-details-marker {
  display: none;
}

.theme-switch-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  padding: 0;
  border-radius: 999px;
  cursor: pointer;
  background: transparent;
  color: var(--color-theme-switch-text);
  border: 1px solid transparent;
  box-shadow: none;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.theme-switch-trigger:hover {
  background: var(--color-theme-switch-hover);
  border-color: color-mix(in srgb, var(--color-theme-switch-text) 16%, transparent);
  box-shadow:
    0 1px 2px 0 rgba(0, 0, 0, 0.1),
    0 6px 14px rgba(0, 0, 0, 0.08);
}

.theme-switch-trigger:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 2px var(--color-sidebar-bg),
    0 0 0 4px color-mix(in srgb, var(--color-link) 85%, transparent);
}

.theme-switch-trigger-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-switch-menu {
  position: absolute;
  left: 50%;
  right: auto;
  top: calc(100% + 6px);
  transform: translateX(-50%);
  z-index: 40;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 40px;
  padding: 6px;
  border-radius: 12px;
  background: var(--color-sidebar-bg);
  border: 1px solid var(--color-sidebar-border);
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.12),
    0 12px 28px rgba(0, 0, 0, 0.1);
}

.theme-switch-option {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  margin: 0;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  color: var(--color-sidebar-text);
  background: transparent;
  transition: background-color 0.15s ease;
}

.theme-switch-option:hover {
  background: var(--color-sidebar-item-hover);
}

.theme-switch-option--active {
  background: var(--color-sidebar-item-active);
  color: var(--color-sidebar-item-active-text);
}

.theme-switch-option:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 2px var(--color-content-bg),
    0 0 0 4px color-mix(in srgb, var(--color-link) 85%, transparent);
}

.theme-switch--compact .theme-switch-trigger {
  width: 28px;
  height: 28px;
}

.theme-switch--compact .theme-switch-menu {
  top: auto;
  bottom: calc(100% + 6px);
  transform: translateX(-50%);
  padding: 4px;
  gap: 2px;
  border-radius: 10px;
  box-shadow:
    0 -4px 12px rgba(0, 0, 0, 0.1),
    0 -8px 24px rgba(0, 0, 0, 0.08);
}

.theme-switch--compact .theme-switch-option {
  width: 30px;
  height: 30px;
}

@media (prefers-reduced-motion: reduce) {
  .theme-switch-trigger {
    transition: none;
  }
}
</style>
