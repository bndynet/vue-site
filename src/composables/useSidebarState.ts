import { inject, provide, readonly, type InjectionKey, type Ref } from 'vue'

const sidebarCollapsedKey: InjectionKey<Ref<boolean>> =
  Symbol.for('vue-site.sidebarCollapsed')

/** Provide the effective desktop sidebar state to shell action components. */
export function provideSidebarState(collapsed: Ref<boolean>) {
  provide(sidebarCollapsedKey, collapsed)
}

/**
 * Return whether the desktop sidebar is currently collapsed.
 *
 * The read-only ref is `false` on mobile layouts, standalone pages, and when no sidebar is shown.
 * This composable must be called from a Vue component rendered inside `createSiteApp()`.
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { useSidebarState } from '@bndynet/vue-site'
 *
 * const { collapsed } = useSidebarState()
 * </script>
 *
 * <template>
 *   <span v-if="!collapsed">Account name</span>
 * </template>
 * ```
 */
export function useSidebarState(): { collapsed: Readonly<Ref<boolean>> } {
  const collapsed = inject(sidebarCollapsedKey)
  if (!collapsed) {
    throw new Error(
      '[vue-site] useSidebarState() must be used within a component rendered by createSiteApp().',
    )
  }
  return { collapsed: readonly(collapsed) }
}
