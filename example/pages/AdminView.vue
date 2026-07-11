<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useLocalize, useSiteConfig } from '@bndynet/vue-site'

const router = useRouter()
const { localize } = useLocalize()
const { refreshAuthNav } = useSiteConfig()

const role = computed(() => localStorage.getItem('role') ?? '')

const stats = [
  { label: { en: 'Active users', zh: '活跃用户' }, value: '1,284' },
  { label: { en: 'Open tickets', zh: '待处理工单' }, value: '37' },
  { label: { en: 'Uptime', zh: '在线时长' }, value: '99.98%' },
]

async function signOut() {
  localStorage.removeItem('role')
  await refreshAuthNav()
  await router.replace('/login')
}
</script>

<template>
  <div class="admin">
    <header class="admin-header">
      <div>
        <h1>{{ localize({ en: 'Admin', zh: '管理' }) }}</h1>
        <p class="subtitle">
          {{ localize({ en: "This page is protected by auth: ['admin']. You can only see it because your current role is", zh: "本页由 auth: ['admin'] 保护。你能看到它，是因为你当前的角色是" }) }}
          <code>{{ role || localize({ en: '(none)', zh: '（无）' }) }}</code
          >.
        </p>
      </div>
      <span class="admin-badge">{{ role || localize({ en: 'guest', zh: '访客' }) }}</span>
    </header>

    <section class="stats">
      <div v-for="stat in stats" :key="stat.label.en" class="stat-card">
        <span class="stat-value">{{ stat.value }}</span>
        <span class="stat-label">{{ localize(stat.label) }}</span>
      </div>
    </section>

    <section class="panel">
      <h2>{{ localize({ en: 'Admin-only controls', zh: '仅管理员可用的操作' }) }}</h2>
      <p>
        {{ localize({ en: 'Visiting #/admin directly while signed out (or as a non-admin) is intercepted by the navigation guard and redirected to the login page.', zh: '未登录（或非管理员）时直接访问 #/admin 会被导航守卫拦截并重定向到登录页。' }) }}
      </p>
      <button type="button" class="sign-out-btn" @click="signOut">{{ localize({ en: 'Sign out', zh: '退出登录' }) }}</button>
    </section>
  </div>
</template>

<style scoped>
.admin {
  max-width: 720px;
}

.admin-header {
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

.admin-badge {
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

.admin code {
  background: var(--color-code-bg);
  color: var(--color-text);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.85em;
}

.stats {
  display: flex;
  gap: 16px;
  margin-bottom: 28px;
}

.stat-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border-radius: 10px;
  background: var(--color-sidebar-bg);
  border: 1px solid var(--color-border);
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-link);
}

.stat-label {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  margin-top: 4px;
}

.panel h2 {
  font-size: 1.25rem;
  margin-bottom: 12px;
  color: var(--color-text);
}

.panel p {
  color: var(--color-text-secondary);
  line-height: 1.7;
  margin-bottom: 20px;
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
