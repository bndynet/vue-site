<script setup lang="ts">
import {
  computed,
  defineAsyncComponent,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type Component,
} from 'vue'
import { useSiteConfig } from '../composables/useSiteConfig'
import type { ShellAction, ShellActionLoader } from '../types'

const props = withDefaults(
  defineProps<{
    placement?: 'top' | 'sidebar'
  }>(),
  { placement: 'top' },
)

const { config } = useSiteConfig()
const warnedStrings = new Set<string>()
const root = ref<HTMLElement | null>(null)
const hasRenderedActions = ref(false)
let observer: MutationObserver | undefined

function resolveAction(action: ShellAction, index: number): { key: string; component: Component } | null {
  if (typeof action === 'string') {
    if (import.meta.env.DEV && !warnedStrings.has(action)) {
      warnedStrings.add(action)
      console.warn(
        `[vue-site] shell.actions string "${action}" was not resolved. ` +
          'String actions are supported by the vue-site CLI; in library mode use a component or dynamic import loader.',
      )
    }
    return null
  }

  if (typeof action === 'function') {
    const component = defineAsyncComponent(async () => {
      const mod = await (action as ShellActionLoader)()
      return mod.default
    })
    return { key: `loader-${index}`, component }
  }

  return { key: `component-${index}`, component: action }
}

const actionComponents = computed(() =>
  (config.shell?.actions ?? [])
    .map(resolveAction)
    .filter((item): item is { key: string; component: Component } => item !== null),
)

const actionAlign = computed(() => {
  const align = config.shell?.align
  return align === 'left' || align === 'right' ? align : 'center'
})

function updateRenderedActionState() {
  hasRenderedActions.value = (root.value?.children.length ?? 0) > 0
}

onMounted(async () => {
  await nextTick()
  updateRenderedActionState()

  if (root.value && typeof MutationObserver !== 'undefined') {
    observer = new MutationObserver(updateRenderedActionState)
    observer.observe(root.value, { childList: true })
  }
})

onBeforeUnmount(() => {
  observer?.disconnect()
})

watch(actionComponents, async () => {
  await nextTick()
  updateRenderedActionState()
})
</script>

<template>
  <div
    v-if="actionComponents.length"
    ref="root"
    class="site-shell-actions"
    :class="[
      `site-shell-actions--${props.placement}`,
      props.placement === 'sidebar' ? `site-shell-actions--align-${actionAlign}` : undefined,
      { 'site-shell-actions--empty': !hasRenderedActions },
    ]"
  >
    <component
      v-for="item in actionComponents"
      :key="item.key"
      :is="item.component"
    />
  </div>
</template>

<style scoped>
.site-shell-actions {
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.site-shell-actions--empty {
  display: none;
}

.site-shell-actions::before {
  content: '';
  display: block;
  flex: 0 0 auto;
  background: color-mix(in srgb, var(--color-theme-switch-text) 22%, transparent);
}

.site-shell-actions--top {
  margin-left: 4px;
  padding-left: 10px;
}

.site-shell-actions--top::before {
  width: 1px;
  height: 22px;
  margin-right: 4px;
}

.site-shell-actions--sidebar {
  flex-wrap: wrap;
  width: 100%;
  margin-top: 2px;
  padding-top: 10px;
}

.site-shell-actions--align-left {
  justify-content: flex-start;
}

.site-shell-actions--align-center {
  justify-content: center;
}

.site-shell-actions--align-right {
  justify-content: flex-end;
}

.site-shell-actions--sidebar::before {
  width: calc(100% + var(--site-sidebar-footer-inline-padding, 12px) * 2);
  height: 1px;
  margin: 0 calc(var(--site-sidebar-footer-inline-padding, 12px) * -1) 4px;
}
</style>
