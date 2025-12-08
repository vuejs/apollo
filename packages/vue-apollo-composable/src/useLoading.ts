import type { ComputedRef } from '@vue/reactivity'
import { computed } from '@vue/reactivity'
import { getCurrentTracking, globalTracking } from './util/loadingTracking.ts'

// #region Component-Level Loading
/**
 * Returns a computed ref indicating if any query in the current component is loading.
 *
 * Must be called inside a setup function.
 *
 * @returns Computed ref that is `true` when any query in this component is loading.
 *
 * @group Loading Composables
 *
 * @example
 * ```vue
 * <script setup>
 * import { useQuery, useQueryLoading } from '@vue/apollo-composable'
 *
 * // Multiple queries in this component
 * const { result: users } = useQuery(GetUsers)
 * const { result: posts } = useQuery(GetPosts)
 *
 * // Single loading indicator for all queries
 * const loading = useQueryLoading()
 * </script>
 *
 * <template>
 *   <div v-if="loading">Loading...</div>
 *   <div v-else>
 *     <UserList :users="users" />
 *     <PostList :posts="posts" />
 *   </div>
 * </template>
 * ```
 */
export function useQueryLoading(): ComputedRef<boolean> {
  const { tracking } = getCurrentTracking()
  if (!tracking) {
    throw new Error('useQueryLoading must be called inside a setup function.')
  }
  return computed(() => tracking.queries.value > 0)
}

/**
 * Returns a computed ref indicating if any mutation in the current component is loading.
 *
 * Must be called inside a setup function.
 *
 * @returns Computed ref that is `true` when any mutation in this component is loading.
 *
 * @group Loading Composables
 *
 * @example
 * ```vue
 * <script setup>
 * import { useMutation, useMutationLoading } from '@vue/apollo-composable'
 *
 * const { mutate: createUser } = useMutation(CreateUser)
 * const { mutate: updateUser } = useMutation(UpdateUser)
 *
 * const saving = useMutationLoading()
 * </script>
 *
 * <template>
 *   <button :disabled="saving">
 *     {{ saving ? 'Saving...' : 'Save' }}
 *   </button>
 * </template>
 * ```
 */
export function useMutationLoading(): ComputedRef<boolean> {
  const { tracking } = getCurrentTracking()
  if (!tracking) {
    throw new Error('useMutationLoading must be called inside a setup function.')
  }
  return computed(() => tracking.mutations.value > 0)
}

/**
 * Returns a computed ref indicating if any subscription in the current component is loading.
 *
 * Must be called inside a setup function.
 *
 * @returns Computed ref that is `true` when any subscription in this component is connecting.
 *
 * @group Loading Composables
 *
 * @example
 * ```vue
 * <script setup>
 * import { useSubscription, useSubscriptionLoading } from '@vue/apollo-composable'
 *
 * const { result: messages } = useSubscription(OnNewMessage)
 * const { result: notifications } = useSubscription(OnNotification)
 *
 * const connecting = useSubscriptionLoading()
 * </script>
 *
 * <template>
 *   <div v-if="connecting">Connecting...</div>
 * </template>
 * ```
 */
export function useSubscriptionLoading(): ComputedRef<boolean> {
  const { tracking } = getCurrentTracking()
  if (!tracking) {
    throw new Error('useSubscriptionLoading must be called inside a setup function.')
  }
  return computed(() => tracking.subscriptions.value > 0)
}
// #endregion

// #region Global Loading
/**
 * Returns a computed ref indicating if any query in the entire app is loading.
 *
 * Can be called anywhere, including outside of setup functions.
 *
 * @returns Computed ref that is `true` when any query in the app is loading.
 *
 * @group Loading Composables
 *
 * @example
 * ```vue
 * <script setup>
 * import { useGlobalQueryLoading } from '@vue/apollo-composable'
 *
 * // Show global loading indicator in app shell
 * const loading = useGlobalQueryLoading()
 * </script>
 *
 * <template>
 *   <AppShell>
 *     <template #header>
 *       <LoadingBar v-if="loading" />
 *     </template>
 *     <RouterView />
 *   </AppShell>
 * </template>
 * ```
 */
export function useGlobalQueryLoading(): ComputedRef<boolean> {
  return computed(() => globalTracking.queries.value > 0)
}

/**
 * Returns a computed ref indicating if any mutation in the entire app is loading.
 *
 * Can be called anywhere, including outside of setup functions.
 *
 * @returns Computed ref that is `true` when any mutation in the app is loading.
 *
 * @group Loading Composables
 */
export function useGlobalMutationLoading(): ComputedRef<boolean> {
  return computed(() => globalTracking.mutations.value > 0)
}

/**
 * Returns a computed ref indicating if any subscription in the entire app is loading.
 *
 * Can be called anywhere, including outside of setup functions.
 *
 * @returns Computed ref that is `true` when any subscription in the app is connecting.
 *
 * @group Loading Composables
 */
export function useGlobalSubscriptionLoading(): ComputedRef<boolean> {
  return computed(() => globalTracking.subscriptions.value > 0)
}
// #endregion
