import { Ref, watch, onUnmounted, ref, getCurrentInstance, onBeforeUnmount } from 'vue-demi'
import { isServer } from './env.js'

export interface LoadingTracking {
  queries: Ref<number>
  mutations: Ref<number>
  subscriptions: Ref<number>
}

export interface AppLoadingTracking extends LoadingTracking {
  components: Map<any, LoadingTracking>
}

export const globalTracking: AppLoadingTracking = {
  queries: ref(0),
  mutations: ref(0),
  subscriptions: ref(0),
  components: new Map(),
}

export function getCurrentTracking () {
  const vm = getCurrentInstance()
  if (!vm) {
    return {}
  }

  let tracking: LoadingTracking

  if (!globalTracking.components.has(vm)) {
    // Add per-component tracking
    globalTracking.components.set(vm, tracking = {
      queries: ref(0),
      mutations: ref(0),
      subscriptions: ref(0),
    })
    // Cleanup
    onUnmounted(() => {
      globalTracking.components.delete(vm)
    })
  } else {
    tracking = globalTracking.components.get(vm) as LoadingTracking
  }

  return {
    tracking,
  }
}

function track (loading: Ref<boolean>, type: keyof LoadingTracking) {
  if (isServer) return

  const { tracking } = getCurrentTracking()

  watch(loading, (value, oldValue) => {
    if (oldValue != null && value !== oldValue) {
      const mod = value ? 1 : -1
      if (tracking) tracking[type].value += mod
      globalTracking[type].value += mod
    }
  }, {
    immediate: true,
  })

  onBeforeUnmount(() => {
    if (loading.value) {
      if (tracking) tracking[type].value--
      globalTracking[type].value--
    }
  })
}

export function trackQuery (loading: Ref<boolean>) {
  track(loading, 'queries')
}

export function trackMutation (loading: Ref<boolean>) {
  track(loading, 'mutations')
}

export function trackSubscription (loading: Ref<boolean>) {
  track(loading, 'subscriptions')
}
