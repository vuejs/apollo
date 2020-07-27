import { getCurrentTracking, getAppTracking } from './util/loadingTracking'
import { computed } from 'vue-demi'

export function useQueryLoading () {
  const { tracking } = getCurrentTracking()
  return computed(() => tracking.queries.value > 0)
}

export function useMutationLoading () {
  const { tracking } = getCurrentTracking()
  return computed(() => tracking.mutations.value > 0)
}

export function useSubscriptionLoading () {
  const { tracking } = getCurrentTracking()
  return computed(() => tracking.subscriptions.value > 0)
}

export function useGlobalQueryLoading () {
  const { appTracking } = getAppTracking()
  return computed(() => appTracking.queries.value > 0)
}

export function useGlobalMutationLoading () {
  const { appTracking } = getAppTracking()
  return computed(() => appTracking.mutations.value > 0)
}

export function useGlobalSubscriptionLoading () {
  const { appTracking } = getAppTracking()
  return computed(() => appTracking.subscriptions.value > 0)
}
