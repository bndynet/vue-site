<script setup lang="ts">
import { ref, useId, watch } from 'vue'
import TooltipOverlay from './TooltipOverlay.vue'

const props = withDefaults(
  defineProps<{
    /** Tooltip text (empty hides tooltip behavior) */
    label: string
    placement?: 'top' | 'bottom'
    /** Hover delay before showing (ms) */
    showDelay?: number
  }>(),
  { placement: 'bottom', showDelay: 200 },
)

const root = ref<HTMLElement | null>(null)
const open = ref(false)
const tipId = useId()
let showTimer: ReturnType<typeof setTimeout> | undefined

function show() {
  if (!props.label.trim()) return
  clearTimeout(showTimer)
  showTimer = setTimeout(() => {
    open.value = true
  }, props.showDelay)
}

function hide() {
  clearTimeout(showTimer)
  open.value = false
}

watch(
  () => props.label,
  () => {
    if (!props.label.trim()) hide()
  },
)

defineExpose({ open })
</script>

<template>
  <span
    ref="root"
    class="ui-tooltip"
    @mouseenter="show"
    @mouseleave="hide"
    @focusin="show"
    @focusout="hide"
  >
    <slot :describedBy="open && label.trim() ? tipId : undefined" />
    <TooltipOverlay
      :id="tipId"
      :open="open && !!label.trim()"
      :text="label"
      :anchor="root"
      :placement="placement"
    />
  </span>
</template>

<style scoped>
.ui-tooltip {
  display: inline-flex;
  align-items: center;
  max-width: 100%;
}
</style>
