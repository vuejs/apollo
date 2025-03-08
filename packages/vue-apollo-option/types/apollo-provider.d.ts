/* eslint no-unused-vars: 0 */

import type { ApolloClient } from '@apollo/client/core/index.js'
import type { App, AsyncComponentOptions, ComponentOptions } from 'vue'
import type {
  ErrorHandler,
  VueApolloComponentOptions,
  WatchLoading,
} from './options'

export type VueApolloComponent<V extends ComponentOptions = ComponentOptions> = VueApolloComponentOptions<V> | AsyncComponentOptions

export interface ApolloProviderOptions<TCacheShape = any> {
  defaultClient: ApolloClient<TCacheShape>
  defaultOptions?: VueApolloComponentOptions<ComponentOptions>
  clients?: { [key: string]: ApolloClient<TCacheShape> }
  watchLoading?: WatchLoading
  errorHandler?: ErrorHandler
  prefetch?: boolean
}

export class ApolloProvider<TCacheShape = any> {
  constructor(options: ApolloProviderOptions<TCacheShape>)
  install(app: App): void

  clients: { [key: string]: ApolloClient<TCacheShape> }
  defaultClient: ApolloClient<TCacheShape>
}
