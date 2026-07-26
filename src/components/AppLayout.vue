<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { useSiteConfig } from '../composables/useSiteConfig'
import { useNavLayout } from '../composables/useNavLayout'
import { useLocalize } from '../composables/useLocalize'
import { provideMobileViewport } from '../composables/useMobileViewport'
import type { PageLayout } from '../types'
import SideNav from './SideNav.vue'
import SiteExternalLinks from './SiteExternalLinks.vue'
import ThemeSwitch from './ThemeSwitch.vue'
import LocaleSwitch from './LocaleSwitch.vue'
import TopPrimaryNav from './TopPrimaryNav.vue'
import ShellActions from './ShellActions.vue'

const { config, resolvedNav } = useSiteConfig()
const { tieredNav, showSidebar, standalone } = useNavLayout()
const { localize } = useLocalize()
const route = useRoute()
const isMobileViewport = ref(false)
const mobileMenuOpen = ref(false)
const menuButton = ref<HTMLButtonElement | null>(null)
const drawerCloseButton = ref<HTMLButtonElement | null>(null)
const mobileDrawer = ref<HTMLElement | null>(null)
let mobileMediaQuery: MediaQueryList | undefined
let previousBodyOverflow = ''

provideMobileViewport(isMobileViewport)

function updateMobileViewport() {
  isMobileViewport.value = mobileMediaQuery?.matches ?? false
}

function closeMobileMenu() {
  mobileMenuOpen.value = false
}

function handleKeydown(event: KeyboardEvent) {
  if (!mobileMenuOpen.value) return

  if (event.key === 'Escape') {
    event.preventDefault()
    closeMobileMenu()
    return
  }

  if (event.key !== 'Tab') return

  const focusable = mobileDrawer.value?.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
  )
  if (!focusable?.length) return

  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  } else if (!mobileDrawer.value?.contains(document.activeElement)) {
    event.preventDefault()
    first.focus()
  }
}

onMounted(() => {
  mobileMediaQuery = window.matchMedia('(max-width: 840px)')
  updateMobileViewport()
  mobileMediaQuery.addEventListener('change', updateMobileViewport)
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  mobileMediaQuery?.removeEventListener('change', updateMobileViewport)
  window.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = previousBodyOverflow
})

watch(isMobileViewport, (isMobile) => {
  if (!isMobile) closeMobileMenu()
})

watch(mobileMenuOpen, async (open) => {
  if (open) {
    previousBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    await nextTick()
    drawerCloseButton.value?.focus()
  } else {
    document.body.style.overflow = previousBodyOverflow
    await nextTick()
    if (isMobileViewport.value) menuButton.value?.focus()
  }
})

watch(() => route.fullPath, closeMobileMenu)

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
      'site-layout--mobile-menu-open': mobileMenuOpen,
    }"
  >
    <header v-if="!standalone" class="site-mobile-header">
      <button
        ref="menuButton"
        class="site-mobile-menu-button"
        type="button"
        :aria-label="localize(mobileMenuOpen
          ? { en: 'Close navigation menu', zh: '关闭导航菜单' }
          : { en: 'Open navigation menu', zh: '打开导航菜单' })"
        aria-controls="site-mobile-drawer"
        :aria-expanded="mobileMenuOpen"
        @click="mobileMenuOpen = !mobileMenuOpen"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <router-link to="/" class="site-mobile-brand">
        <img
          v-if="config.logo"
          class="site-mobile-logo"
          :src="config.logo"
          :alt="`${siteTitle} logo`"
          decoding="async"
        />
        <span class="site-mobile-title">{{ siteTitle }}</span>
      </router-link>
    </header>
    <header v-if="tieredNav && !isMobileViewport" class="site-primary-nav">
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
    <button
      v-if="isMobileViewport && !standalone && mobileMenuOpen"
      class="site-mobile-backdrop"
      type="button"
      :aria-label="localize({ en: 'Close navigation menu', zh: '关闭导航菜单' })"
      @click="closeMobileMenu"
    ></button>
    <aside
      v-if="showSidebar || (isMobileViewport && !standalone)"
      id="site-mobile-drawer"
      ref="mobileDrawer"
      class="site-sidebar"
      :class="{ 'site-sidebar--mobile-open': mobileMenuOpen }"
      :role="isMobileViewport ? 'dialog' : undefined"
      :aria-label="isMobileViewport ? localize({ en: 'Site navigation', zh: '站点导航' }) : undefined"
      :aria-modal="isMobileViewport && mobileMenuOpen ? 'true' : undefined"
      :aria-hidden="isMobileViewport && !mobileMenuOpen ? 'true' : undefined"
    >
      <div v-if="!tieredNav || isMobileViewport" class="site-sidebar-header">
        <div v-if="isMobileViewport" class="site-sidebar-mobile-heading">
          {{ localize({ en: 'Navigation', zh: '导航' }) }}
        </div>
        <div v-else class="site-sidebar-brand">
          <img
            v-if="config.logo"
            class="site-sidebar-logo"
            :src="config.logo"
            :alt="`${siteTitle} logo`"
            decoding="async"
          />
          <div class="site-sidebar-title">{{ siteTitle }}</div>
        </div>
        <button
          v-if="isMobileViewport"
          ref="drawerCloseButton"
          class="site-sidebar-close"
          type="button"
          :aria-label="localize({ en: 'Close navigation menu', zh: '关闭导航菜单' })"
          @click="closeMobileMenu"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="m18 6-12 12M6 6l12 12" />
          </svg>
        </button>
      </div>
      <SideNav :items="isMobileViewport && !standalone ? resolvedNav : undefined" />
      <div
        v-if="!tieredNav || siteFooter || isMobileViewport"
        class="site-sidebar-footer"
      >
        <div v-if="!tieredNav || (isMobileViewport && !standalone)" class="site-sidebar-toolbar">
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
        v-if="tieredNav && !showSidebar && !isMobileViewport && siteFooter"
        class="site-footer-standalone"
      >
        <p class="site-footer-text">{{ siteFooter }}</p>
      </footer>
    </main>
  </div>
</template>
