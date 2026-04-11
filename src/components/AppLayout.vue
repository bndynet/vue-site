<script setup lang="ts">
import { useSiteConfig } from '../composables/useSiteConfig'
import { useNavLayout } from '../composables/useNavLayout'
import SideNav from './SideNav.vue'
import SiteExternalLinks from './SiteExternalLinks.vue'
import ThemeSwitch from './ThemeSwitch.vue'
import TopPrimaryNav from './TopPrimaryNav.vue'

const { config } = useSiteConfig()
const { tieredNav, showSidebar } = useNavLayout()
</script>

<template>
  <div
    class="site-layout"
    :class="{
      'site-layout--tiered-nav': tieredNav,
      'site-layout--tiered-no-sidebar': tieredNav && !showSidebar,
    }"
  >
    <header v-if="tieredNav" class="site-primary-nav">
      <router-link to="/" class="site-primary-nav-brand">
        <img
          v-if="config.logo"
          class="site-primary-nav-logo"
          :src="config.logo"
          :alt="`${config.title} logo`"
          decoding="async"
        />
        <span class="site-primary-nav-title">{{ config.title }}</span>
      </router-link>
      <TopPrimaryNav />
      <div class="site-primary-nav-end">
        <SiteExternalLinks />
        <ThemeSwitch class="site-primary-nav-theme" />
      </div>
    </header>
    <aside v-if="showSidebar" class="site-sidebar">
      <div v-if="!tieredNav" class="site-sidebar-header">
        <div class="site-sidebar-brand">
          <img
            v-if="config.logo"
            class="site-sidebar-logo"
            :src="config.logo"
            :alt="`${config.title} logo`"
            decoding="async"
          />
          <div class="site-sidebar-title">{{ config.title }}</div>
        </div>
      </div>
      <SideNav />
      <div
        v-if="!tieredNav || config.footer"
        class="site-sidebar-footer"
      >
        <div v-if="!tieredNav" class="site-sidebar-toolbar">
          <SiteExternalLinks compact />
          <ThemeSwitch compact />
        </div>
        <p v-if="config.footer" class="site-footer-text">{{ config.footer }}</p>
      </div>
    </aside>
    <main class="site-content">
      <div class="site-content-inner">
        <router-view />
      </div>
    </main>
    <footer
      v-if="tieredNav && !showSidebar && config.footer"
      class="site-footer-standalone"
    >
      <p class="site-footer-text">{{ config.footer }}</p>
    </footer>
  </div>
</template>
