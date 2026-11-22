<script setup lang="ts">
import { useLocalize } from '@bndynet/vue-site'

const { localize } = useLocalize()
</script>

<template>
  <section class="help-overview">
    <h1>{{ localize({ en: 'Help', zh: '帮助' }) }}</h1>
    <p>
      {{ localize({
        en: 'Choose a help topic from the sidebar. External resources open in a new tab.',
        zh: '请从侧边栏选择帮助主题。外部资源会在新标签页中打开。',
      }) }}
    </p>
  </section>
</template>

<style scoped>
.help-overview h1 {
  margin-top: 0;
  color: var(--color-sidebar-title);
}

.help-overview p {
  color: var(--color-content-text);
}
</style>
