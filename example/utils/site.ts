import { getSiteConfig } from '@bndynet/vue-site'

/** Read the selected site config at runtime, outside Vue's setup / injection context. */
export function getApiBaseUrl() {
  return getSiteConfig().custom?.apiBaseUrl
}
