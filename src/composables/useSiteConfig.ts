import { inject, provide, type InjectionKey } from 'vue'
import type { SiteConfig, ResolvedNavItem } from '../types'

export interface SiteContext {
  config: SiteConfig
  resolvedNav: ResolvedNavItem[]
}

export const siteContextKey: InjectionKey<SiteContext> = Symbol('site-context')

export function provideSiteConfig(context: SiteContext) {
  provide(siteContextKey, context)
}

export function useSiteConfig(): SiteContext {
  const ctx = inject(siteContextKey)
  if (!ctx) {
    throw new Error('useSiteConfig() must be used within a site created by createSiteApp()')
  }
  return ctx
}
