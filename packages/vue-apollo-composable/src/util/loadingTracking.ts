import { Ref, watch, onUnmounted, ref, getCurrentInstance } from '@vue/composition-api'

export interface LoadingTracking {
  queries: Ref<number>
  mutations: Ref<number>
  subscriptions: Ref<number>
}

export interface AppLoadingTracking extends LoadingTracking {
  components: Map<any, LoadingTracking>
}

export function getAppTracking () {
  const root: any = getCurrentInstance().$root
  let appTracking: AppLoadingTracking

  if (!root._apolloAppTracking) {
    // Add per Vue tracking
    appTracking = root._apolloAppTracking = {
      queries: ref(0),
      mutations: ref(0),
      subscriptions: ref(0),
      components: new Map(),
    }
  } else {
    appTracking = root._apolloAppTracking
  }

  return {
    appTracking
  }
}

export function getCurrentTracking () {
  const { appTracking } = getAppTracking()
  const currentInstance = getCurrentInstance()
  
  let tracking: LoadingTracking

  if (!appTracking.components.has(currentInstance)) {
    // Add per-component tracking
    appTracking.components.set(currentInstance, tracking = {
      queries: ref(0),
      mutations: ref(0),
      subscriptions: ref(0),
    })
    // Cleanup
    onUnmounted(() => {
      appTracking.components.delete(currentInstance)
    })
  } else {
    tracking = appTracking.components.get(currentInstance)
  }

  return {
    appTracking,
    tracking
  }
}

export function trackQuery (loading: Ref<boolean>) {
  const { appTracking, tracking } = getCurrentTracking()

  watch(loading, (value, oldValue) => {
    if (oldValue != null) {
      const mod = value ? 1 : -1
      tracking.queries.value += mod
      appTracking.queries.value += mod
    }
  })
}

export function trackMutation (loading: Ref<boolean>) {
  const { appTracking, tracking } = getCurrentTracking()

  watch(loading, (value, oldValue) => {
    if (oldValue != null) {
      const mod = value ? 1 : -1
      tracking.mutations.value += mod
      appTracking.mutations.value += mod
    }
  })
}

export function trackSubscription (loading: Ref<boolean>) {
  const { appTracking, tracking } = getCurrentTracking()

  watch(loading, (value, oldValue) => {
    if (oldValue != null) {
      const mod = value ? 1 : -1
      tracking.subscriptions.value += mod
      appTracking.subscriptions.value += mod
    }
  })
}
