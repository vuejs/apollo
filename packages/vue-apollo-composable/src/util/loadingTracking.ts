import { Ref, watch, onUnmounted, ref } from '@vue/composition-api'
import { getCurrentVue, getCurrentVM } from '@vue/composition-api/dist/runtimeContext'
import { VueConstructor } from 'vue'

export interface LoadingTracking {
  queries: Ref<number>
  mutations: Ref<number>
  subscriptions: Ref<number>
}

export interface AppLoadingTracking extends LoadingTracking {
  components: Map<any, LoadingTracking>
}

const trackingMap = new Map<VueConstructor, AppLoadingTracking>()

export function getAppTracking () {
  const currentVue = getCurrentVue()
  let appTracking: AppLoadingTracking

  if (!trackingMap.has(currentVue)) {
    // Add per Vue tracking
    trackingMap.set(currentVue, appTracking = {
      queries: ref(0),
      mutations: ref(0),
      subscriptions: ref(0),
      components: new Map(),
    })
  } else {
    appTracking = trackingMap.get(currentVue)
  }

  return {
    appTracking
  }
}

export function getCurrentTracking () {
  const { appTracking } = getAppTracking()
  const currentVM = getCurrentVM()
  
  let tracking: LoadingTracking

  if (!appTracking.components.has(currentVM)) {
    // Add per-component tracking
    appTracking.components.set(currentVM, tracking = {
      queries: ref(0),
      mutations: ref(0),
      subscriptions: ref(0),
    })
    // Cleanup
    onUnmounted(() => {
      appTracking.components.delete(currentVM)
    })
  } else {
    tracking = appTracking.components.get(currentVM)
  }

  return {
    appTracking,
    tracking
  }
}

export function trackQuery (loading: Ref<boolean>) {
  const { appTracking, tracking } = getCurrentTracking()

  watch(loading, value => {
    const mod = value ? 1 : -1
    tracking.queries.value += mod
    appTracking.queries.value += mod
  })
}

export function trackMutation (loading: Ref<boolean>) {
  const { appTracking, tracking } = getCurrentTracking()

  watch(loading, value => {
    const mod = value ? 1 : -1
    tracking.mutations.value += mod
    appTracking.mutations.value += mod
  })
}

export function trackSubscription (loading: Ref<boolean>) {
  const { appTracking, tracking } = getCurrentTracking()

  watch(loading, value => {
    const mod = value ? 1 : -1
    tracking.subscriptions.value += mod
    appTracking.subscriptions.value += mod
  })
}
