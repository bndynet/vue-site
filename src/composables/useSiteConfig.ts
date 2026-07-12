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

interface SiteConfigRuntimeState {
  activeConfig: SiteConfig | null
}

const siteConfigStateKey = Symbol.for('vue-site.siteConfigRuntimeState')

function getSiteConfigState(): SiteConfigRuntimeState {
  const globalScope = globalThis as typeof globalThis &
    Record<symbol, SiteConfigRuntimeState | undefined>
  const existing = globalScope[siteConfigStateKey]
  if (existing) return existing

  const state: SiteConfigRuntimeState = { activeConfig: null }
  globalScope[siteConfigStateKey] = state
  return state
}

const siteConfigState = getSiteConfigState()

/** Register the configuration for access outside Vue's injection context. */
export function registerSiteConfig(config: SiteConfig) {
  siteConfigState.activeConfig = config
}

export function provideSiteConfig(context: SiteContext) {
  provide(siteContextKey, context)
}

/**
 * Return the active site configuration outside Vue's setup / injection context.
 * `createSiteApp()` must have started before this function is called.
 */
export function getSiteConfig(): SiteConfig {
  const config = siteConfigState.activeConfig
  if (!config) {
    throw new Error(
      '[vue-site] getSiteConfig() is unavailable before createSiteApp() starts. ' +
        'Call it from runtime code instead of during module initialization.',
    )
  }
  return config
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
