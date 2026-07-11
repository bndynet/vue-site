import { inject, provide, type InjectionKey } from 'vue'
import type { SiteConfig, ResolvedNavItem } from '../types'

export interface SiteContext {
  /** Original site configuration passed to `createSiteApp()`. */
  config: SiteConfig
  /** Auth-filtered nav tree rendered by the layout. Kept as a reactive array. */
  resolvedNav: ResolvedNavItem[]
  /** Re-run auth menu filtering after consumer auth state changes, such as login/logout. */
  refreshAuthNav: () => Promise<void>
}

/** Use `Symbol.for` so pages still inject context if Vite resolves the package twice. */
export const siteContextKey: InjectionKey<SiteContext> =
  Symbol.for('vue-site.siteContext')

export function provideSiteConfig(context: SiteContext) {
  provide(siteContextKey, context)
}

export function useSiteConfig(): SiteContext {
  const ctx = inject(siteContextKey)
  if (!ctx) {
    throw new Error(
      '[vue-site] useSiteConfig() must be used within an app created by createSiteApp().',
    )
  }
  return ctx
}
