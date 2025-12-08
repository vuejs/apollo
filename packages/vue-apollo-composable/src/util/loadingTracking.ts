import type { EffectScope, Ref } from '@vue/reactivity'
import { getCurrentScope, onScopeDispose, ref } from '@vue/reactivity'
import { watch } from '@vue/runtime-core'

// #region Types
/** Loading counters for each operation type. */
export interface LoadingTracking {
  queries: Ref<number>
  mutations: Ref<number>
  subscriptions: Ref<number>
}

/** App-level loading tracking with per-component breakdown. */
export interface AppLoadingTracking extends LoadingTracking {
  components: Map<EffectScope, LoadingTracking>
}
// #endregion

// #region Global State
/** Global loading tracking state. */
export const globalTracking: AppLoadingTracking = {
  queries: ref(0),
  mutations: ref(0),
  subscriptions: ref(0),
  components: new Map(),
}
// #endregion

// #region Helpers
/** Detect if running on server. */
const isServer = typeof window === 'undefined'

/**
 * Get or create loading tracking for the current component scope.
 *
 * @returns Object with the current component's tracking, or empty object if no scope.
 */
export function getCurrentTracking(): { tracking?: LoadingTracking } {
  const currentScope = getCurrentScope()
  if (!currentScope) {
    return {}
  }

  let tracking: LoadingTracking

  if (isServer) {
    // SSR does not support onScopeDispose cleanup, so create isolated tracking
    // to avoid memory leaks
    tracking = {
      queries: ref(0),
      mutations: ref(0),
      subscriptions: ref(0),
    }
    return { tracking }
  }

  if (!globalTracking.components.has(currentScope)) {
    // Add per-component tracking
    tracking = {
      queries: ref(0),
      mutations: ref(0),
      subscriptions: ref(0),
    }
    globalTracking.components.set(currentScope, tracking)

    // Cleanup when component is disposed
    onScopeDispose(() => {
      globalTracking.components.delete(currentScope)
    })
  }
  else {
    tracking = globalTracking.components.get(currentScope)!
  }

  return { tracking }
}

/**
 * Track a loading ref and update counters when it changes.
 */
function track(loading: Ref<boolean>, type: keyof LoadingTracking) {
  if (isServer)
    return

  const { tracking } = getCurrentTracking()

  watch(loading, (value, oldValue) => {
    if (oldValue != null && value !== oldValue) {
      const mod = value ? 1 : -1
      if (tracking) {
        tracking[type].value += mod
      }
      globalTracking[type].value += mod
    }
  }, { immediate: true })

  onScopeDispose(() => {
    if (loading.value) {
      if (tracking) {
        tracking[type].value--
      }
      globalTracking[type].value--
    }
  })
}
// #endregion

// #region Public API
/**
 * Track a query's loading state.
 *
 * @param loading - The loading ref from useQuery.
 */
export function trackQuery(loading: Ref<boolean>) {
  track(loading, 'queries')
}

/**
 * Track a mutation's loading state.
 *
 * @param loading - The loading ref from useMutation.
 */
export function trackMutation(loading: Ref<boolean>) {
  track(loading, 'mutations')
}

/**
 * Track a subscription's loading state.
 *
 * @param loading - The loading ref from useSubscription.
 */
export function trackSubscription(loading: Ref<boolean>) {
  track(loading, 'subscriptions')
}
// #endregion
