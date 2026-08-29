<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
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

// Touch has no hover, so a tap reveals the tooltip immediately instead of waiting
// for the hover delay; tapping anywhere outside the trigger dismisses it.
function showNow() {
  if (!props.label.trim()) return
  clearTimeout(showTimer)
  open.value = true
}

function onDocumentPointerDown(event: PointerEvent) {
  if (root.value && !root.value.contains(event.target as Node)) hide()
}

onMounted(() => {
  document.addEventListener('pointerdown', onDocumentPointerDown)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocumentPointerDown)
})

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
    @pointerdown="showNow"
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
