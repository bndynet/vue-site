<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useSiteConfig } from '../composables/useSiteConfig'
import { getFirstLeafPath, subtreeContainsPath, isExternalLink } from '../nav-utils'
import { useLocalize } from '../composables/useLocalize'
import DynamicIcon from './DynamicIcon.vue'
import UiTooltip from './UiTooltip.vue'

const { resolvedNav } = useSiteConfig()
const route = useRoute()
const { localize } = useLocalize()

const links = computed(() =>
  resolvedNav.map((item) => {
    const external = !!item.link && isExternalLink(item.link)
    const to = item.link ?? (item.isGroup ? getFirstLeafPath(item) ?? '/' : item.resolvedPath)
    const active = external
      ? false
      : item.link
        ? route.path === item.link
        : subtreeContainsPath(item, route.path)
    return { item, to, external, active }
  }),
)
const leftLinks = computed(() => links.value.filter(({ item }) => item.position !== 'right'))
const rightLinks = computed(() => links.value.filter(({ item }) => item.position === 'right'))
</script>

<template>
  <nav class="site-primary-nav-links" aria-label="Primary">
    <div class="site-primary-nav-start">
      <template v-for="{ item, to, external, active } in leftLinks" :key="item.resolvedPath">
        <a
          v-if="external"
          :href="item.link"
          class="site-primary-nav-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          <DynamicIcon v-if="item.icon" :name="item.icon" :size="17" />
          <span class="site-primary-nav-link-label">{{ localize(item.label) }}</span>
        </a>
        <router-link
          v-else
          :to="to"
          class="site-primary-nav-link"
          :class="{ 'site-primary-nav-link--active': active }"
        >
          <DynamicIcon v-if="item.icon" :name="item.icon" :size="17" />
          <span class="site-primary-nav-link-label">{{ localize(item.label) }}</span>
        </router-link>
      </template>
    </div>
    <div v-if="rightLinks.length" class="site-primary-nav-end-links">
      <template v-for="{ item, to, external, active } in rightLinks" :key="item.resolvedPath">
        <UiTooltip
          v-if="item.icon"
          :label="localize(item.label)"
          placement="bottom"
          #="{ describedBy }"
        >
          <a
            v-if="external"
            :href="item.link"
            class="site-primary-nav-link site-icon-action"
            :aria-label="localize(item.label)"
            :aria-describedby="describedBy"
            target="_blank"
            rel="noopener noreferrer"
          >
            <DynamicIcon :name="item.icon" :size="18" />
          </a>
          <router-link
            v-else
            :to="to"
            class="site-primary-nav-link site-icon-action"
            :class="{ 'site-icon-action--active': active }"
            :aria-label="localize(item.label)"
            :aria-describedby="describedBy"
          >
            <DynamicIcon :name="item.icon" :size="18" />
          </router-link>
        </UiTooltip>
        <a
          v-else-if="external"
          :href="item.link"
          class="site-primary-nav-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span class="site-primary-nav-link-label">{{ localize(item.label) }}</span>
        </a>
        <router-link
          v-else
          :to="to"
          class="site-primary-nav-link"
          :class="{ 'site-primary-nav-link--active': active }"
        >
          <span class="site-primary-nav-link-label">{{ localize(item.label) }}</span>
        </router-link>
      </template>
    </div>
  </nav>
</template>

<style scoped>
.site-primary-nav-links {
  display: flex;
  align-items: stretch;
  min-width: 0;
  flex: 1;
  padding: 0;
}

.site-primary-nav-start {
  display: flex;
  align-items: stretch;
  min-width: 0;
  flex: 1 1 auto;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
}

.site-primary-nav-end-links {
  display: flex;
  align-items: stretch;
  flex: 0 0 auto;
  gap: var(--site-icon-action-gap);
  margin: 0 var(--site-icon-action-gap) 0 auto;
}

.site-primary-nav-link:not(.site-icon-action) {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  padding: 0 14px;
  border-radius: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-sidebar-text);
  text-decoration: none;
  background: transparent;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.site-primary-nav-link:not(.site-icon-action):hover {
  background: var(--color-sidebar-item-hover);
  text-decoration: none;
}

.site-primary-nav-link--active:not(.site-icon-action) {
  background: var(--color-sidebar-item-active);
  color: var(--color-link);
}

.site-primary-nav-link-label {
  white-space: nowrap;
}

</style>
