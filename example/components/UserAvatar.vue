<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useLocalize, useSiteConfig } from '@bndynet/vue-site'

const router = useRouter()
const { localize } = useLocalize()
const { refreshAuthNav } = useSiteConfig()

const root = ref<HTMLElement | null>(null)
const menu = ref<HTMLElement | null>(null)
const open = ref(false)
const menuReady = ref(false)
const menuTop = ref(0)
const menuLeft = ref(0)
const role = ref(localStorage.getItem('role') ?? '')

const displayName = computed(() => {
  if (role.value === 'admin') return localize({ en: 'Admin', zh: '管理员' })
  return localize({ en: 'User', zh: '用户' })
})
const initials = computed(() => displayName.value.charAt(0).toUpperCase())

function syncRole() {
  role.value = localStorage.getItem('role') ?? ''
}

function closeOnOutsideClick(event: MouseEvent) {
  const target = event.target as Node
  if (!root.value?.contains(target) && !menu.value?.contains(target)) {
    open.value = false
  }
}

function placeMenu() {
  const anchor = root.value
  const popup = menu.value
  if (!anchor || !popup || !open.value) return

  const gap = 8
  const margin = 8
  const anchorRect = anchor.getBoundingClientRect()
  const popupRect = popup.getBoundingClientRect()
  const below = anchorRect.bottom + gap + popupRect.height <= window.innerHeight - margin

  const top = below
    ? anchorRect.bottom + gap
    : Math.max(margin, anchorRect.top - gap - popupRect.height)
  const centeredLeft = anchorRect.left + anchorRect.width / 2 - popupRect.width / 2
  const left = Math.min(
    window.innerWidth - margin - popupRect.width,
    Math.max(margin, centeredLeft),
  )

  menuTop.value = top
  menuLeft.value = left
  menuReady.value = true
}

async function goTo(path: string) {
  open.value = false
  await router.push(path)
}

async function signOut() {
  localStorage.removeItem('role')
  syncRole()
  open.value = false
  await refreshAuthNav()
  await router.replace('/login')
}

onMounted(() => {
  document.addEventListener('click', closeOnOutsideClick)
  window.addEventListener('resize', placeMenu)
  window.addEventListener('scroll', placeMenu, true)
  window.addEventListener('storage', syncRole)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closeOnOutsideClick)
  window.removeEventListener('resize', placeMenu)
  window.removeEventListener('scroll', placeMenu, true)
  window.removeEventListener('storage', syncRole)
})

watch(open, async (value) => {
  menuReady.value = false
  if (!value) return
  await nextTick()
  requestAnimationFrame(placeMenu)
})
</script>

<template>
  <div v-if="role" ref="root" class="user-avatar">
    <button
      class="user-avatar-trigger"
      type="button"
      :aria-expanded="open"
      aria-haspopup="menu"
      @click.stop="open = !open"
    >
      <span class="user-avatar-mark">{{ initials }}</span>
      <span class="user-avatar-name">{{ displayName }}</span>
    </button>

    <Teleport to="body">
      <div
        v-if="open"
        ref="menu"
        class="user-avatar-menu"
        role="menu"
        :style="{
          top: `${menuTop}px`,
          left: `${menuLeft}px`,
          visibility: menuReady ? 'visible' : 'hidden',
        }"
      >
        <button type="button" role="menuitem" @click="goTo('/auth-page')">
          {{ localize({ en: 'Auth page', zh: '鉴权页' }) }}
        </button>
        <button v-if="role === 'admin'" type="button" role="menuitem" @click="goTo('/admin')">
          {{ localize({ en: 'Admin', zh: '管理' }) }}
        </button>
        <button type="button" role="menuitem" class="user-avatar-menu-danger" @click="signOut">
          {{ localize({ en: 'Sign out', zh: '退出登录' }) }}
        </button>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.user-avatar {
  position: relative;
  display: flex;
  align-items: center;
}

.user-avatar-trigger {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 34px;
  max-width: 140px;
  padding: 0 10px 0 4px;
  border: 1px solid transparent;
  border-radius: 999px;
  background: transparent;
  color: var(--color-theme-switch-text);
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    color 0.2s ease;
}

.user-avatar-trigger:hover,
.user-avatar-trigger[aria-expanded='true'] {
  background: var(--color-theme-switch-hover);
  border-color: color-mix(in srgb, var(--color-theme-switch-text) 16%, transparent);
  box-shadow:
    0 1px 2px 0 rgba(0, 0, 0, 0.1),
    0 6px 14px rgba(0, 0, 0, 0.08);
}

.user-avatar-trigger:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 2px var(--color-sidebar-bg),
    0 0 0 4px color-mix(in srgb, var(--color-link) 85%, transparent);
}

.user-avatar-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 999px;
  background: var(--color-link);
  color: #fff;
  font-size: 0.8rem;
  font-weight: 700;
  line-height: 1;
}

.user-avatar-name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.85rem;
  font-weight: 600;
}

.user-avatar-menu {
  position: fixed;
  z-index: 1000;
  min-width: 148px;
  padding: 6px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-content-bg);
  box-shadow:
    0 12px 28px rgba(0, 0, 0, 0.14),
    0 2px 8px rgba(0, 0, 0, 0.08);
}

.user-avatar-menu button {
  display: block;
  width: 100%;
  padding: 8px 10px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--color-text);
  font: inherit;
  font-size: 0.85rem;
  text-align: left;
  cursor: pointer;
}

.user-avatar-menu button:hover,
.user-avatar-menu button:focus-visible {
  outline: none;
  background: var(--color-sidebar-item-hover);
}

.user-avatar-menu-danger {
  color: var(--color-link-hover) !important;
}
</style>
