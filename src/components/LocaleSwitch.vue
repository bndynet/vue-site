<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useId } from 'vue'
import { useLocale } from '../composables/useLocale'
import { useSiteConfig } from '../composables/useSiteConfig'
import type { LocaleOption } from '../types'
import DynamicIcon from './DynamicIcon.vue'
import TooltipOverlay from './TooltipOverlay.vue'

const { locale, setLocale } = useLocale()
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

const choices = computed<LocaleOption[]>(() => config.i18n?.locales ?? [])

const current = computed(
  () => choices.value.find((o) => o.code === locale.value) ?? choices.value[0],
)

const triggerIcon = computed(() => current.value?.icon ?? 'languages')

function pick(code: string) {
  setLocale(code)
  if (detailsRef.value) {
    detailsRef.value.open = false
  }
}
</script>

<template>
  <details
    ref="detailsRef"
    class="locale-switch"
    :class="{ 'locale-switch--compact': props.compact }"
  >
    <summary
      ref="summaryRef"
      class="locale-switch-trigger"
      aria-label="Language"
      :aria-describedby="summaryTipOpen ? summaryTipId : undefined"
      @mouseenter="onSummaryEnter"
      @mouseleave="onSummaryLeave"
    >
      <span class="locale-switch-trigger-icon" aria-hidden="true">
        <DynamicIcon :name="triggerIcon" :size="iconSize" />
      </span>
    </summary>
    <div class="locale-switch-menu" role="group" aria-label="Language options">
      <button
        v-for="opt in choices"
        :key="opt.code"
        type="button"
        class="locale-switch-option"
        :class="{ 'locale-switch-option--active': opt.code === locale }"
        :aria-label="opt.label"
        :aria-pressed="opt.code === locale"
        @click="pick(opt.code)"
      >
        <DynamicIcon v-if="opt.icon" :name="opt.icon" :size="iconSize" />
        <span class="locale-switch-option-label">{{ opt.label }}</span>
      </button>
    </div>
    <TooltipOverlay
      :id="summaryTipId"
      :open="summaryTipOpen"
      text="Language"
      :anchor="summaryRef"
      :placement="summaryTipPlacement"
    />
  </details>
</template>

<style scoped>
.locale-switch {
  position: relative;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  width: fit-content;
  max-width: 100%;
  color: var(--color-theme-switch-text);
}

.locale-switch summary {
  list-style: none;
}

.locale-switch summary::-webkit-details-marker {
  display: none;
}

.locale-switch-trigger {
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

.locale-switch-trigger:hover {
  background: var(--color-theme-switch-hover);
  border-color: color-mix(in srgb, var(--color-theme-switch-text) 16%, transparent);
  box-shadow:
    0 1px 2px 0 rgba(0, 0, 0, 0.1),
    0 6px 14px rgba(0, 0, 0, 0.08);
}

.locale-switch-trigger:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 2px var(--color-sidebar-bg),
    0 0 0 4px color-mix(in srgb, var(--color-link) 85%, transparent);
}

.locale-switch-trigger-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.locale-switch-menu {
  position: absolute;
  left: 50%;
  right: auto;
  top: calc(100% + 6px);
  transform: translateX(-50%);
  z-index: 40;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 2px;
  min-width: 140px;
  padding: 6px;
  border-radius: 12px;
  background: var(--color-sidebar-bg);
  border: 1px solid var(--color-sidebar-border);
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.12),
    0 12px 28px rgba(0, 0, 0, 0.1);
}

.locale-switch-option {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 12px;
  margin: 0;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  text-align: left;
  white-space: nowrap;
  color: var(--color-sidebar-text);
  background: transparent;
  transition: background-color 0.15s ease;
}

.locale-switch-option:hover {
  background: var(--color-sidebar-item-hover);
}

.locale-switch-option--active {
  background: var(--color-sidebar-item-active);
  color: var(--color-sidebar-item-active-text);
}

.locale-switch-option:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 2px var(--color-content-bg),
    0 0 0 4px color-mix(in srgb, var(--color-link) 85%, transparent);
}

.locale-switch-option-label {
  flex: 1;
}

.locale-switch--compact .locale-switch-trigger {
  width: 28px;
  height: 28px;
}

.locale-switch--compact .locale-switch-menu {
  top: auto;
  bottom: calc(100% + 6px);
  transform: translateX(-50%);
  padding: 4px;
  border-radius: 10px;
  box-shadow:
    0 -4px 12px rgba(0, 0, 0, 0.1),
    0 -8px 24px rgba(0, 0, 0, 0.08);
}

@media (prefers-reduced-motion: reduce) {
  .locale-switch-trigger {
    transition: none;
  }
}
</style>
