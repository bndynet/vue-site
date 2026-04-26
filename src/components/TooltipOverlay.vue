<script setup lang="ts">
import {
  nextTick,
  onBeforeUnmount,
  ref,
  watch,
} from 'vue'

const props = withDefaults(
  defineProps<{
    /** Matches `aria-describedby` on the trigger */
    id: string
    open: boolean
    text: string
    /** Trigger element (pass a template ref; it unwraps to the DOM node) */
    anchor: HTMLElement | null
    placement?: 'top' | 'bottom'
  }>(),
  { placement: 'bottom' },
)

const tipRef = ref<HTMLElement | null>(null)
const top = ref(0)
const left = ref(0)

function measure() {
  const anchor = props.anchor
  const tip = tipRef.value
  if (!anchor || !tip || !props.open || !props.text) return
  const a = anchor.getBoundingClientRect()
  const tr = tip.getBoundingClientRect()
  const gap = 8
  const placeTop = props.placement === 'top'
  const y = placeTop ? a.top - gap - tr.height : a.bottom + gap
  const cx = a.left + a.width / 2
  left.value = cx - tr.width / 2
  top.value = y
  const pad = 8
  const vw = window.innerWidth
  if (left.value < pad) left.value = pad
  if (left.value + tr.width > vw - pad) left.value = vw - pad - tr.width
}

let ro: ResizeObserver | undefined

function bindObservers() {
  ro?.disconnect()
  if (tipRef.value && typeof ResizeObserver !== 'undefined') {
    ro = new ResizeObserver(() => measure())
    ro.observe(tipRef.value)
  }
}

watch(
  () => [props.open, props.text, props.placement, props.anchor] as const,
  async () => {
    if (!props.open || !props.text) return
    await nextTick()
    requestAnimationFrame(() => {
      measure()
      bindObservers()
    })
  },
)

watch(
  () => props.open,
  (open) => {
    if (open) {
      window.addEventListener('scroll', measure, true)
      window.addEventListener('resize', measure)
    } else {
      window.removeEventListener('scroll', measure, true)
      window.removeEventListener('resize', measure)
      ro?.disconnect()
      ro = undefined
    }
  },
)

onBeforeUnmount(() => {
  window.removeEventListener('scroll', measure, true)
  window.removeEventListener('resize', measure)
  ro?.disconnect()
})

defineExpose({ measure })
</script>

<template>
  <Teleport to="body">
    <div
      v-show="open && text"
      :id="id"
      ref="tipRef"
      role="tooltip"
      class="tooltip-overlay"
      :style="{
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        zIndex: 10000,
      }"
    >
      {{ text }}
    </div>
  </Teleport>
</template>

<style scoped>
.tooltip-overlay {
  max-width: min(280px, calc(100vw - 16px));
  padding: 6px 10px;
  font-size: 0.75rem;
  line-height: 1.35;
  font-weight: 500;
  color: var(--color-sidebar-text, #606770);
  background: var(--color-sidebar-bg, #f5f6f7);
  border: 1px solid var(--color-sidebar-border, #ebedf0);
  border-radius: 8px;
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.12),
    0 2px 4px rgba(0, 0, 0, 0.06);
  pointer-events: none;
}
</style>
