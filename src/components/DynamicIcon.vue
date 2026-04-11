<script setup lang="ts">
import { computed, h, type Component } from 'vue'
import * as icons from 'lucide-vue-next'

const props = defineProps<{
  name: string
  size?: number
}>()

function toPascalCase(str: string): string {
  return str
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('')
}

const iconComponent = computed<Component | null>(() => {
  const pascal = toPascalCase(props.name)
  const allIcons = icons as unknown as Record<string, Component>
  return allIcons[pascal] ?? allIcons[pascal + 'Icon'] ?? null
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
