<script lang="ts">
const warnedMissingIcons = new Set<string>()
</script>

<script setup lang="ts">
import { computed, type Component } from 'vue'
import { useSiteConfig } from '../composables/useSiteConfig'

const props = defineProps<{
  name: string
  size?: number
}>()

const { config } = useSiteConfig()

function normalizeIconName(str: string): string {
  return str
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase()
}

const iconComponent = computed<Component | null>(() => {
  const icons = config.icons ?? {}
  const normalized = normalizeIconName(props.name)
  const component = icons[props.name] ?? icons[normalized] ?? null

  if (import.meta.env.DEV && !component && !warnedMissingIcons.has(props.name)) {
    warnedMissingIcons.add(props.name)
    console.warn(`[vue-site] Icon "${props.name}" was not found in the icon registry.`)
  }

  return component
})
</script>

<template>
  <component
    v-if="iconComponent"
    :is="iconComponent"
    :size="size ?? 18"
    :stroke-width="1.75"
  />
</template>
