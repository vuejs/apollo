/* eslint no-unused-vars: 0 */

import Vue, { AsyncComponent } from 'vue'
import { ApolloClient } from 'apollo-client'
import {
  VueApolloComponentOptions,
  WatchLoading,
  ErrorHandler
} from './options'

export type VueApolloComponent<V extends Vue = Vue> = VueApolloComponentOptions<V> | typeof Vue | AsyncComponent

export class ApolloProvider<TCacheShape=any> {
  provide: (key?: string) => this
  constructor (options: {
    defaultClient: ApolloClient<TCacheShape>,
    defaultOptions?: VueApolloComponentOptions<Vue>,
    clients?: { [key: string]: ApolloClient<TCacheShape> },
    watchLoading?: WatchLoading,
    errorHandler?: ErrorHandler,
    prefetch?: boolean
  })
  clients: { [key: string]: ApolloClient<TCacheShape> }
  defaultClient: ApolloClient<TCacheShape>
}
