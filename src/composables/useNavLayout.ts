import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useSiteConfig } from './useSiteConfig'
import { maxNavDepth, findActiveTopLevelItem } from '../nav-utils'

const TIERED_DEPTH_THRESHOLD = 3

export function useNavLayout() {
  const { resolvedNav } = useSiteConfig()
  const route = useRoute()

  const tieredNav = computed(
    () => maxNavDepth(resolvedNav) >= TIERED_DEPTH_THRESHOLD,
  )

  const sidebarNav = computed(() => {
    if (!tieredNav.value) return resolvedNav
    const top = findActiveTopLevelItem(resolvedNav, route.path)
    return top?.resolvedChildren ?? []
  })

  /** Tiered mode: hide sidebar when the active top-level item has no sub-nav. */
  const showSidebar = computed(
    () => !tieredNav.value || sidebarNav.value.length > 0,
  )

  return { tieredNav, sidebarNav, showSidebar }
}
