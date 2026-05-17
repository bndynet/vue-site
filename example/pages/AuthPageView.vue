<script setup lang="ts">
import { computed } from 'vue'

const role = computed(() => localStorage.getItem('role') ?? '')

function signOut() {
  localStorage.removeItem('role')
  // Full reload so the startup nav filter re-runs and the guard re-evaluates.
  window.location.hash = '/login'
  window.location.reload()
}
</script>

<template>
  <div class="auth-page">
    <header class="auth-page-header">
      <div>
        <h1>Auth Page</h1>
        <p class="subtitle">
          This page is protected by <code>auth: true</code> — any signed-in user may enter,
          regardless of role. You are signed in as <code>{{ role || '(none)' }}</code
          >.
        </p>
      </div>
      <span class="auth-page-badge">{{ role || 'guest' }}</span>
    </header>

    <section class="panel">
      <h2>How this works</h2>
      <ul>
        <li>Visiting <code>#/auth-page</code> while signed out is intercepted and redirected to the login page.</li>
        <li>Once signed in (as <code>user</code> or <code>admin</code>), the route is allowed.</li>
        <li>
          Compare with <code>#/admin</code>, which uses <code>auth: ['admin']</code> and is hidden /
          blocked for non-admins.
        </li>
      </ul>
      <button type="button" class="sign-out-btn" @click="signOut">Sign out</button>
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
