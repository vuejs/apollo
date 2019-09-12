import Vue, { PluginObject, PluginFunction } from 'vue'
import {
  ApolloClient,
  ObservableQuery,
  ApolloQueryResult,
  QueryOptions,
  WatchQueryOptions,
  MutationOptions,
  SubscriptionOptions,
} from 'apollo-client'
import { FetchResult } from 'apollo-link'
import { Observable } from 'apollo-client/util/Observable'
import { ApolloProvider, VueApolloComponent } from './apollo-provider'
import {
  VueApolloQueryDefinition,
  VueApolloSubscriptionDefinition,
  WatchLoading,
  ErrorHandler,
} from './options'
import { GraphQLError } from 'graphql'

export class VueApollo extends ApolloProvider implements PluginObject<{}>{
  [key: string]: any
  install: PluginFunction<{}>

  static install(pVue: typeof Vue, options?:{} | undefined): void
}

interface SmartApollo<V> {
  skip: boolean
  refresh(): void
  start(): void
  stop(): void
}

type PickedObservableQuery = Pick<ObservableQuery, 
  'fetchMore' |
  'subscribeToMore' |
  'refetch' |
  'setVariables' |
  'setOptions' |
  'startPolling' |
  'stopPolling'
>

export interface SmartQuery<V> extends SmartApollo<V>, PickedObservableQuery {
  loading: boolean
}

export interface SmartSubscription<V> extends SmartApollo<V> {
}

interface ClientOptions {
  client?: string
}

interface ApolloClientMethods<R> {
  query: (options: QueryOptions & ClientOptions) => ReturnType<ApolloClient<R>['query']>
  watchQuery: (options: WatchQueryOptions & ClientOptions) => ReturnType<ApolloClient<R>['watchQuery']>
  mutate: (options: MutationOptions & ClientOptions) => ReturnType<ApolloClient<R>['mutate']>
  subscribe: (options: SubscriptionOptions & ClientOptions) => ReturnType<ApolloClient<R>['subscribe']>
}

export interface DollarApollo<V, R = any> extends ApolloClientMethods<R> {
  vm: V
  queries: Record<string, SmartQuery<V>>
  subscriptions: Record<string, SmartSubscription<V>>
  readonly provider: ApolloProvider
  readonly loading: boolean

  // writeonly not yet implemented in TypeScript: https://github.com/Microsoft/TypeScript/issues/21759
  /* writeonly */ skipAllQueries: boolean
  /* writeonly */ skipAllSubscriptions: boolean
  /* writeonly */ skipAll: boolean

  getClient<R = any>(): ApolloClient<R>

  addSmartQuery<R = any>(key: string, options: VueApolloQueryDefinition<V, R>): SmartQuery<V>
  addSmartSubscription<R = any>(key: string, options: VueApolloSubscriptionDefinition): SmartSubscription<V>
}
