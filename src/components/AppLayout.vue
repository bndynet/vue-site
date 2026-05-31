<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import { useSiteConfig } from '../composables/useSiteConfig'
import { useNavLayout } from '../composables/useNavLayout'
import { useLocalize } from '../composables/useLocalize'
import SideNav from './SideNav.vue'
import SiteExternalLinks from './SiteExternalLinks.vue'
import ThemeSwitch from './ThemeSwitch.vue'
import LocaleSwitch from './LocaleSwitch.vue'
import TopPrimaryNav from './TopPrimaryNav.vue'

const { config } = useSiteConfig()
const { tieredNav, showSidebar, standalone } = useNavLayout()
const { localize } = useLocalize()

const themeEnabled = computed(() => config.theme !== false)
const localeEnabled = computed(() => (config.i18n?.locales?.length ?? 0) > 1)
const siteTitle = computed(() => localize(config.title))
const siteFooter = computed(() => localize(config.footer))

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
        </div>
        <p v-if="siteFooter" class="site-footer-text">{{ siteFooter }}</p>
      </div>
    </aside>
    <main class="site-content">
      <div class="site-content-inner">
        <router-view />
      </div>
    </main>
    <footer
      v-if="tieredNav && !showSidebar && siteFooter"
      class="site-footer-standalone"
    >
      <p class="site-footer-text">{{ siteFooter }}</p>
    </footer>
  </div>
</template>
