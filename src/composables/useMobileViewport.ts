import { inject, provide, readonly, type InjectionKey, type Ref } from 'vue'

const mobileViewportKey: InjectionKey<Ref<boolean>> =
  Symbol.for('vue-site.mobileViewport')

/**
 * Breakpoint in CSS pixels below which the site switches to the mobile layout.
 *
 * CSS `@media (max-width: ...)` rules cannot read this value (media queries do not
 * support `var()`), so any change here must also update the matching media queries in
 * `src/styles/layout.css`, `src/styles/markdown.css`, `src/components/SideNav.vue`,
 * and `src/components/ShellActions.vue`. Those files carry a `keep in sync` comment.
 */
export const MOBILE_BREAKPOINT_PX = 840

/** Provide the active viewport state to components rendered by the site layout. */
export function provideMobileViewport(isMobileViewport: Ref<boolean>) {
  provide(mobileViewportKey, isMobileViewport)
}

/**
 * Return the site's reactive mobile viewport state.
 *
 * The value is `true` when the viewport is {@link MOBILE_BREAKPOINT_PX} CSS pixels wide or
 * narrower. It is shared with the responsive site layout and updates when the viewport crosses
 * that breakpoint.
 *
 * This composable must be called from a Vue component rendered inside `createSiteApp()`.
 * The returned ref is read-only; use CSS media queries for presentation-only changes.
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { useMobileViewport } from '@bndynet/vue-site'
 *
 * const isMobileViewport = useMobileViewport()
 * </script>
 *
 * <template>
 *   <button v-if="isMobileViewport">Open compact menu</button>
 * </template>
 * ```
 */
export function useMobileViewport(): Readonly<Ref<boolean>> {
  const isMobileViewport = inject(mobileViewportKey)
  if (!isMobileViewport) {
    throw new Error(
      '[vue-site] useMobileViewport() must be used within a component rendered by createSiteApp().',
    )
  }
  return readonly(isMobileViewport)
}
