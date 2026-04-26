<script setup lang="ts">
import { computed } from 'vue'
import { useSiteConfig } from '../composables/useSiteConfig'
import DynamicIcon from './DynamicIcon.vue'
import UiTooltip from './UiTooltip.vue'

withDefaults(
  defineProps<{
    /** Smaller hit targets for sidebar footer */
    compact?: boolean
  }>(),
  { compact: false },
)

const { config } = useSiteConfig()

function linkTooltip(item: { link: string; title?: string }): string {
  const t = item.title?.trim()
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
    :class="{ 'site-external-links--compact': compact }"
  >
    <UiTooltip
      v-for="(item, i) in items"
      :key="`${item.link}-${i}`"
      :label="linkTooltip(item)"
      :placement="compact ? 'top' : 'bottom'"
      #="{ describedBy }"
    >
      <a
        class="site-external-link"
        :href="item.link"
        target="_blank"
        rel="noopener noreferrer"
        :aria-describedby="describedBy"
        :aria-label="linkTooltip(item)"
      >
        <DynamicIcon :name="item.icon" :size="compact ? 15 : 18" />
      </a>
    </UiTooltip>
  </div>
</template>

<style scoped>
.site-external-links {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Match `.theme-switch-trigger` for a unified icon toolbar */
.site-external-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  padding: 0;
  border-radius: 999px;
  text-decoration: none;
  cursor: pointer;
  background: transparent;
  color: var(--color-theme-switch-text);
  border: 1px solid transparent;
  box-shadow: none;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    color 0.2s ease;
}

.site-external-link:hover {
  background: var(--color-theme-switch-hover);
  border-color: color-mix(in srgb, var(--color-theme-switch-text) 16%, transparent);
  box-shadow:
    0 1px 2px 0 rgba(0, 0, 0, 0.1),
    0 6px 14px rgba(0, 0, 0, 0.08);
  text-decoration: none;
}

.site-external-link:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 2px var(--color-sidebar-bg),
    0 0 0 4px color-mix(in srgb, var(--color-link) 85%, transparent);
}

.site-external-links--compact .site-external-link {
  width: 28px;
  height: 28px;
}
</style>
