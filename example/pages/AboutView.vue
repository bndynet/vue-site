<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useTheme } from '@bndynet/vue-site'

const { theme } = useTheme()

/** Set when the user switches theme (not on initial load). */
const lastThemeChange = ref<string | null>(null)

watch(theme, (next, prev) => {
  if (prev !== undefined) {
    lastThemeChange.value = `${prev} → ${next}`
  }
})

const tabs = ['Overview', 'Team', 'Contact']
const activeTab = ref('Overview')

const teamMembers = ref([
  { name: 'Alice Chen', role: 'Lead Developer', avatar: '👩‍💻' },
  { name: 'Bob Park', role: 'Designer', avatar: '🎨' },
  { name: 'Carol Wu', role: 'Product Manager', avatar: '📋' },
])

const form = ref({ name: '', message: '' })
const submitted = ref(false)

function handleSubmit() {
  if (form.value.name && form.value.message) {
    submitted.value = true
    setTimeout(() => {
      submitted.value = false
      form.value = { name: '', message: '' }
    }, 2000)
  }
}

const charCount = computed(() => form.value.message.length)
</script>

<template>
  <div class="about">
    <h1>About</h1>
    <p class="subtitle">This page is a Vue component with reactive state, tabs, and a form.</p>

    <p class="theme-line" aria-live="polite">
      <span class="theme-line-label">Current theme:</span>
      <code class="theme-line-value">{{ theme }}</code>
      <span v-if="lastThemeChange" class="theme-line-change">
        (last switch: <code>{{ lastThemeChange }}</code>)
      </span>
    </p>

    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab"
        :class="['tab', { active: activeTab === tab }]"
        @click="activeTab = tab"
      >
        {{ tab }}
      </button>
    </div>

    <div v-if="activeTab === 'Overview'" class="panel">
      <h2>Overview</h2>
      <p>This demonstrates that <code>.vue</code> component pages work with full Vue 3 reactivity, scoped styles, computed properties, and lifecycle hooks.</p>
      <div class="stats">
        <div class="stat-card">
          <span class="stat-value">3</span>
          <span class="stat-label">Tabs</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ teamMembers.length }}</span>
          <span class="stat-label">Team Members</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ charCount }}</span>
          <span class="stat-label">Message Chars</span>
        </div>
      </div>
    </div>

    <div v-if="activeTab === 'Team'" class="panel">
      <h2>Team</h2>
      <div class="team-grid">
        <div v-for="member in teamMembers" :key="member.name" class="member-card">
          <span class="member-avatar">{{ member.avatar }}</span>
          <strong>{{ member.name }}</strong>
          <span class="member-role">{{ member.role }}</span>
        </div>
      </div>
    </div>

    <div v-if="activeTab === 'Contact'" class="panel">
      <h2>Contact</h2>
      <form class="contact-form" @submit.prevent="handleSubmit">
        <label>
          Name
          <input v-model="form.name" type="text" placeholder="Your name" />
        </label>
        <label>
          Message
          <textarea v-model="form.message" placeholder="Write something..." rows="4" />
        </label>
        <button type="submit" class="submit-btn" :disabled="!form.name || !form.message">
          {{ submitted ? 'Sent!' : 'Send Message' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.about {
  max-width: 720px;
}

.subtitle {
  color: var(--color-text-secondary);
  margin-bottom: 24px;
}

.theme-line {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  margin-bottom: 20px;
  line-height: 1.6;
}

.theme-line-label {
  margin-right: 6px;
}

.theme-line-value,
.theme-line-change code {
  background: var(--color-code-bg);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.85em;
  color: var(--color-text);
}

.theme-line-change {
  margin-left: 8px;
}

.tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 24px;
  border-bottom: 2px solid var(--color-border);
  padding-bottom: 0;
}

.tab {
  padding: 8px 18px;
  border: none;
  background: none;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: color 0.15s, border-color 0.15s;
}

.tab:hover {
  color: var(--color-text);
}

.tab.active {
  color: var(--color-link);
  border-bottom-color: var(--color-link);
}

.panel {
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

.panel h2 {
  font-size: 1.25rem;
  margin-bottom: 16px;
  color: var(--color-text);
}

.panel p {
  color: var(--color-text-secondary);
  line-height: 1.7;
  margin-bottom: 20px;
}

.panel code {
  background: var(--color-code-bg);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.875em;
}

.stats {
  display: flex;
  gap: 16px;
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
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-link);
}

.stat-label {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  margin-top: 4px;
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}

.member-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 24px 16px;
  border-radius: 10px;
  background: var(--color-sidebar-bg);
  border: 1px solid var(--color-border);
}

.member-avatar {
  font-size: 2.5rem;
}

.member-role {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.contact-form label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text);
}

.contact-form input,
.contact-form textarea {
  padding: 10px 14px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 0.9rem;
  background: var(--color-content-bg);
  color: var(--color-text);
  font-family: inherit;
  outline: none;
  transition: border-color 0.15s;
}

.contact-form input:focus,
.contact-form textarea:focus {
  border-color: var(--color-link);
}

.submit-btn {
  align-self: flex-start;
  padding: 10px 24px;
  background: var(--color-link);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.15s;
}

.submit-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
