<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const role = computed(() => localStorage.getItem('role') ?? '')

const stats = [
  { label: 'Active users', value: '1,284' },
  { label: 'Open tickets', value: '37' },
  { label: 'Uptime', value: '99.98%' },
]

async function signOut() {
  localStorage.removeItem('role')
  // `router.replace` works in both hash and HTML5 modes; the reload re-runs the startup nav filter.
  await router.replace('/login')
  window.location.reload()
}
</script>

<template>
  <div class="admin">
    <header class="admin-header">
      <div>
        <h1>Admin</h1>
        <p class="subtitle">
          This page is protected by <code>auth: ['admin']</code>. You can only see it because your
          current role is <code>{{ role || '(none)' }}</code
          >.
        </p>
      </div>
      <span class="admin-badge">{{ role || 'guest' }}</span>
    </header>

    <section class="stats">
      <div v-for="stat in stats" :key="stat.label" class="stat-card">
        <span class="stat-value">{{ stat.value }}</span>
        <span class="stat-label">{{ stat.label }}</span>
      </div>
    </section>

    <section class="panel">
      <h2>Admin-only controls</h2>
      <p>
        Visiting <code>#/admin</code> directly while signed out (or as a non-admin) is intercepted by
        the navigation guard and redirected to the login page.
      </p>
      <button type="button" class="sign-out-btn" @click="signOut">Sign out</button>
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
