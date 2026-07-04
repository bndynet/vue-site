<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { useSiteConfig } from '../composables/useSiteConfig'
import { useNavLayout } from '../composables/useNavLayout'
import { useLocalize } from '../composables/useLocalize'
import type { PageLayout } from '../types'
import SideNav from './SideNav.vue'
import SiteExternalLinks from './SiteExternalLinks.vue'
import ThemeSwitch from './ThemeSwitch.vue'
import LocaleSwitch from './LocaleSwitch.vue'
import TopPrimaryNav from './TopPrimaryNav.vue'
import ShellActions from './ShellActions.vue'

const { config } = useSiteConfig()
const { tieredNav, showSidebar, standalone } = useNavLayout()
const { localize } = useLocalize()
const route = useRoute()

const themeEnabled = computed(() => config.theme !== false)
const localeEnabled = computed(() => (config.i18n?.locales?.length ?? 0) > 1)
const siteTitle = computed(() => localize(config.title))
const siteFooter = computed(() => localize(config.footer))
const pageLayout = computed<PageLayout>(() => {
  const navItem = route.meta.navItem as { layout?: PageLayout } | undefined
  const layout = navItem?.layout
  if (layout === 'wide' || layout === 'full') return layout
  if (layout === 'default') return layout
  return route.meta.standalone ? 'full' : 'default'
})

watchEffect(() => {
  document.title = siteTitle.value
})
</script>

<template>
  <div
    class="site-layout"
    :class="{
      'site-layout--tiered-nav': tieredNav,
      'site-layout--tiered-no-sidebar': tieredNav && !showSidebar,
      'site-layout--blank': standalone,
    }"
  >
    <header v-if="tieredNav" class="site-primary-nav">
      <router-link to="/" class="site-primary-nav-brand">
        <img
          v-if="config.logo"
          class="site-primary-nav-logo"
          :src="config.logo"
          :alt="`${siteTitle} logo`"
          decoding="async"
        />
        <span class="site-primary-nav-title">{{ siteTitle }}</span>
      </router-link>
      <TopPrimaryNav />
      <div class="site-primary-nav-end">
        <SiteExternalLinks />
        <LocaleSwitch v-if="localeEnabled" />
        <ThemeSwitch v-if="themeEnabled" class="site-primary-nav-theme" />
        <ShellActions />
      </div>
    </header>
    <aside v-if="showSidebar" class="site-sidebar">
      <div v-if="!tieredNav" class="site-sidebar-header">
        <div class="site-sidebar-brand">
          <img
            v-if="config.logo"
            class="site-sidebar-logo"
            :src="config.logo"
            :alt="`${siteTitle} logo`"
            decoding="async"
          />
          <div class="site-sidebar-title">{{ siteTitle }}</div>
        </div>
      </div>
      <SideNav />
      <div
        v-if="!tieredNav || siteFooter"
        class="site-sidebar-footer"
      >
        <div v-if="!tieredNav" class="site-sidebar-toolbar">
          <SiteExternalLinks compact />
          <LocaleSwitch v-if="localeEnabled" compact />
          <ThemeSwitch v-if="themeEnabled" compact />
          <ShellActions placement="sidebar" />
        </div>
        <p v-if="siteFooter" class="site-footer-text">{{ siteFooter }}</p>
      </div>
    </aside>
    <main class="site-content">
      <div class="site-content-inner" :class="`site-content-inner--${pageLayout}`">
        <router-view />
      </div>
      <footer
        v-if="tieredNav && !showSidebar && siteFooter"
        class="site-footer-standalone"
      >
        <p class="site-footer-text">{{ siteFooter }}</p>
      </footer>
    </main>
  </div>
</template>
