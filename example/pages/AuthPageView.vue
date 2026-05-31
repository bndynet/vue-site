<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useLocalize } from '@bndynet/vue-site'

const router = useRouter()
const { localize } = useLocalize()

const role = computed(() => localStorage.getItem('role') ?? '')

async function signOut() {
  localStorage.removeItem('role')
  // `router.replace` works in both hash and HTML5 modes; the reload re-runs the startup nav filter.
  await router.replace('/login')
  window.location.reload()
}
</script>

<template>
  <div class="auth-page">
    <header class="auth-page-header">
      <div>
        <h1>{{ localize({ en: 'Auth Page', zh: '鉴权页' }) }}</h1>
        <p class="subtitle">
          {{ localize({ en: 'This page is protected by auth: true — any signed-in user may enter, regardless of role. You are signed in as', zh: '本页由 auth: true 保护——任何已登录用户都可进入，无论角色。你当前登录为' }) }}
          <code>{{ role || localize({ en: '(none)', zh: '（无）' }) }}</code
          >.
        </p>
      </div>
      <span class="auth-page-badge">{{ role || localize({ en: 'guest', zh: '访客' }) }}</span>
    </header>

    <section class="panel">
      <h2>{{ localize({ en: 'How this works', zh: '工作原理' }) }}</h2>
      <ul>
        <li>{{ localize({ en: 'Visiting #/auth-page while signed out is intercepted and redirected to the login page.', zh: '未登录时访问 #/auth-page 会被拦截并重定向到登录页。' }) }}</li>
        <li>{{ localize({ en: 'Once signed in (as user or admin), the route is allowed.', zh: '登录后（user 或 admin）即可访问该路由。' }) }}</li>
        <li>
          {{ localize({ en: "Compare with #/admin, which uses auth: ['admin'] and is hidden / blocked for non-admins.", zh: '对比 #/admin：它使用 auth: [\'admin\']，对非管理员隐藏 / 拦截。' }) }}
        </li>
      </ul>
      <button type="button" class="sign-out-btn" @click="signOut">{{ localize({ en: 'Sign out', zh: '退出登录' }) }}</button>
    </section>
  </div>
</template>

<style scoped>
.auth-page {
  max-width: 720px;
}

.auth-page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}

.subtitle {
  color: var(--color-text-secondary);
  line-height: 1.7;
  margin-top: 8px;
}

.auth-page-badge {
  flex-shrink: 0;
  padding: 4px 12px;
  border-radius: 999px;
  background: var(--color-link);
  color: #fff;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.auth-page code {
  background: var(--color-code-bg);
  color: var(--color-text);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.85em;
}

.panel h2 {
  font-size: 1.25rem;
  margin-bottom: 12px;
  color: var(--color-text);
}

.panel ul {
  color: var(--color-text-secondary);
  line-height: 1.8;
  margin: 0 0 20px;
  padding-left: 20px;
}

.sign-out-btn {
  padding: 10px 24px;
  background: transparent;
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.sign-out-btn:hover {
  background: var(--color-sidebar-item-hover);
}
</style>
