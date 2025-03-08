import { computed } from 'vue-demi'
import { getCurrentTracking, globalTracking } from './util/loadingTracking'

export function useQueryLoading() {
  const { tracking } = getCurrentTracking()
  if (!tracking)
    throw new Error('useQueryLoading must be called inside a setup function.')
  return computed(() => tracking.queries.value > 0)
}

export function useMutationLoading() {
  const { tracking } = getCurrentTracking()
  if (!tracking)
    throw new Error('useMutationLoading must be called inside a setup function.')
  return computed(() => tracking.mutations.value > 0)
}

export function useSubscriptionLoading() {
  const { tracking } = getCurrentTracking()
  if (!tracking)
    throw new Error('useSubscriptionLoading must be called inside a setup function.')
  return computed(() => tracking.subscriptions.value > 0)
}

export function useGlobalQueryLoading() {
  return computed(() => globalTracking.queries.value > 0)
}

export function useGlobalMutationLoading() {
  return computed(() => globalTracking.mutations.value > 0)
}

export function useGlobalSubscriptionLoading() {
  return computed(() => globalTracking.subscriptions.value > 0)
}
