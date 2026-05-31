<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLocalize } from '@bndynet/vue-site'

const route = useRoute()
const router = useRouter()
const { localize } = useLocalize()

const currentRole = computed(() => localStorage.getItem('role') ?? '')
const redirectTarget = computed(() => {
  const r = route.query.redirect
  return typeof r === 'string' && r ? r : '/'
})

// The nav menu is filtered once at startup (auth is evaluated when the app is created), so we do a
// full reload after changing the role. `router.replace` updates the URL correctly for the active
// history mode (hash or HTML5), then a full reload re-runs createSiteApp so the nav filter and the
// navigation guard re-evaluate for the new role.
async function reloadTo(path: string) {
  await router.replace(path)
  window.location.reload()
}

function loginAs(role: 'user' | 'admin') {
  localStorage.setItem('role', role)
  reloadTo(redirectTarget.value)
}

function logout() {
  localStorage.removeItem('role')
  reloadTo('/login')
}
</script>

<template>
  <div class="login">
    <div class="login-card">
      <h1 class="login-title">{{ localize({ en: 'Sign in', zh: '登录' }) }}</h1>
      <p class="login-subtitle">
        {{ localize({ en: 'This standalone page demonstrates auth. Pick a role to sign in; you will be sent to', zh: '这个独立页面演示 auth。选择一个角色登录后，你将被跳转到' }) }}
        <code>{{ redirectTarget }}</code
        >.
      </p>
      <p class="login-status">
        {{ localize({ en: 'Current role:', zh: '当前角色：' }) }}
        <code>{{ currentRole || localize({ en: '(not signed in)', zh: '（未登录）' }) }}</code>
      </p>
      <div class="login-actions">
        <button class="login-btn" type="button" @click="loginAs('user')">{{ localize({ en: 'Sign in as user', zh: '以 user 登录' }) }}</button>
        <button class="login-btn login-btn--primary" type="button" @click="loginAs('admin')">
          {{ localize({ en: 'Sign in as admin', zh: '以 admin 登录' }) }}
        </button>
        <button class="login-btn login-btn--ghost" type="button" @click="logout">{{ localize({ en: 'Sign out', zh: '退出登录' }) }}</button>
      </div>
      <router-link to="/" class="login-link">{{ localize({ en: '← Back to the site', zh: '← 返回站点' }) }}</router-link>
    </div>
  </div>
</template>

<style scoped>
.login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  box-sizing: border-box;
  background: var(--color-bg);
  color: var(--color-text);
}

.login-card {
  max-width: 460px;
  width: 100%;
  text-align: center;
}

.login-title {
  font-size: 2.25rem;
  margin-bottom: 12px;
  color: var(--color-text);
}

.login-subtitle {
  font-size: 1rem;
  line-height: 1.7;
  color: var(--color-text-secondary);
  margin-bottom: 16px;
}

.login-status {
  color: var(--color-text-secondary);
  margin-bottom: 24px;
}

.login code {
  background: var(--color-code-bg);
  color: var(--color-code-text);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.875em;
}

.login-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 24px;
}

.login-btn {
  padding: 10px 16px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background: var(--color-content-bg);
  color: var(--color-text);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}

.login-btn:hover {
  background: var(--color-sidebar-item-hover);
}

.login-btn--primary {
  background: var(--color-link);
  border-color: var(--color-link);
  color: #fff;
}

.login-btn--primary:hover {
  background: var(--color-link-hover);
  border-color: var(--color-link-hover);
}

.login-btn--ghost {
  background: transparent;
}

.login-link {
  display: inline-block;
  color: var(--color-link);
  font-weight: 500;
  text-decoration: none;
}

.login-link:hover {
  color: var(--color-link-hover);
  text-decoration: underline;
}
</style>
