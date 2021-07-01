/* eslint no-unused-vars: 0 */

import { ComponentOptions, AsyncComponentOptions, App } from 'vue'
import { ApolloClient } from '@apollo/client/core'
import {
  VueApolloComponentOptions,
  WatchLoading,
  ErrorHandler,
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

export class ApolloProvider<TCacheShape=any> {
  constructor (options: ApolloProviderOptions<TCacheShape>)
  install (app: App): void

  clients: { [key: string]: ApolloClient<TCacheShape> }
  defaultClient: ApolloClient<TCacheShape>
}
