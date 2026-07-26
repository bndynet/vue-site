import { inject, provide, readonly, type InjectionKey, type Ref } from 'vue'

const mobileViewportKey: InjectionKey<Ref<boolean>> =
  Symbol.for('vue-site.mobileViewport')

/** Provide the active viewport state to components rendered by the site layout. */
export function provideMobileViewport(isMobileViewport: Ref<boolean>) {
  provide(mobileViewportKey, isMobileViewport)
}

/**
 * Return the site's reactive mobile viewport state.
 *
 * The value is `true` when the viewport is 840 CSS pixels wide or narrower. It is shared with
 * the responsive site layout and updates when the viewport crosses that breakpoint.
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
