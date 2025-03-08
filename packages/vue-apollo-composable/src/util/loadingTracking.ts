import type { EffectScope, Ref } from 'vue-demi'
import { getCurrentScope, onScopeDispose, ref, watch } from 'vue-demi'

import { isServer } from './env.js'

export interface LoadingTracking {
  queries: Ref<number>
  mutations: Ref<number>
  subscriptions: Ref<number>
}

export interface AppLoadingTracking extends LoadingTracking {
  components: Map<EffectScope, LoadingTracking>
}

export const globalTracking: AppLoadingTracking = {
  queries: ref(0),
  mutations: ref(0),
  subscriptions: ref(0),
  components: new Map(),
}

export function getCurrentTracking() {
  const currentScope = getCurrentScope()
  if (!currentScope) {
    return {}
  }

  let tracking: LoadingTracking
  if (isServer) {
    // SSR does not support onScopeDispose, so if we don't skip this, it will leak memory
    tracking = {
      queries: ref(0),
      mutations: ref(0),
      subscriptions: ref(0),
    }
    return { tracking }
  }

  if (!globalTracking.components.has(currentScope)) {
    // Add per-component tracking
    globalTracking.components.set(currentScope, tracking = {
      queries: ref(0),
      mutations: ref(0),
      subscriptions: ref(0),
    })
    // Cleanup
    onScopeDispose(() => {
      globalTracking.components.delete(currentScope)
    })
  }
  else {
    tracking = globalTracking.components.get(currentScope) as LoadingTracking
  }

  return {
    tracking,
  }
}

function track(loading: Ref<boolean>, type: keyof LoadingTracking) {
  if (isServer)
    return

  const { tracking } = getCurrentTracking()

  watch(loading, (value, oldValue) => {
    if (oldValue != null && value !== oldValue) {
      const mod = value ? 1 : -1
      if (tracking)
        tracking[type].value += mod
      globalTracking[type].value += mod
    }
  }, {
    immediate: true,
  })

  onScopeDispose(() => {
    if (loading.value) {
      if (tracking)
        tracking[type].value--
      globalTracking[type].value--
    }
  })
}

export function trackQuery(loading: Ref<boolean>) {
  track(loading, 'queries')
}

export function trackMutation(loading: Ref<boolean>) {
  track(loading, 'mutations')
}

export function trackSubscription(loading: Ref<boolean>) {
  track(loading, 'subscriptions')
}
