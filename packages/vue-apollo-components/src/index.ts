import type { App, Plugin } from 'vue'
import ApolloFragment from './ApolloFragment.vue'
import ApolloMutation from './ApolloMutation.vue'
import ApolloQuery from './ApolloQuery.vue'
import ApolloSubscribeToMore from './ApolloSubscribeToMore.vue'
import ApolloSubscription from './ApolloSubscription.vue'

export { ApolloFragment, ApolloMutation, ApolloQuery, ApolloSubscribeToMore, ApolloSubscription }
export { ApolloQueryKey } from './keys.ts'

/**
 * Registers every component globally.
 *
 * Prefer importing them directly: global registration loses the generic slot-prop types.
 *
 * @example
 * ```ts
 * app.use(VueApolloComponents)
 * ```
 */
export const VueApolloComponents: Plugin = {
  install(app: App) {
    app.component('ApolloQuery', ApolloQuery)
    app.component('ApolloFragment', ApolloFragment)
    app.component('ApolloMutation', ApolloMutation)
    app.component('ApolloSubscription', ApolloSubscription)
    app.component('ApolloSubscribeToMore', ApolloSubscribeToMore)
  },
}

export default VueApolloComponents
