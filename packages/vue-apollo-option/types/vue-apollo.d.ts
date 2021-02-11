import Vue, { PluginObject, PluginFunction } from 'vue'
import {
  ApolloClient,
  ObservableQuery,
  ApolloQueryResult,
  QueryOptions,
  WatchQueryOptions,
  MutationOptions,
  SubscriptionOptions,
  OperationVariables,
  FetchResult,
  Observable,
} from '@apollo/client/core'
import { ApolloProvider } from './apollo-provider'
import {
  VueApolloQueryDefinition,
  VueApolloSubscriptionDefinition,
} from './options'

export class VueApollo extends ApolloProvider implements PluginObject<Record<string, never>> {
  [key: string]: any
  install: PluginFunction<Record<string, never>>

  static install(pVue: typeof Vue, options?:Record<string, never> | undefined): void
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

export type SmartSubscription<V> = SmartApollo<V>

interface ClientOptions {
  client?: string
}

interface ApolloClientMethods {
  query<R = any, TVariables = OperationVariables>(options: QueryOptions<TVariables> & ClientOptions): Promise<ApolloQueryResult<R>>
  watchQuery<R = any, TVariables = OperationVariables>(options: WatchQueryOptions<TVariables> & ClientOptions): ObservableQuery<R, TVariables>
  mutate<R = any, TVariables = OperationVariables>(options: MutationOptions<R, TVariables> & ClientOptions): Promise<FetchResult<R>>
  subscribe<R = any, TVariables = OperationVariables>(options: SubscriptionOptions<TVariables> & ClientOptions): Observable<FetchResult<R>>
}

export interface DollarApollo<V> extends ApolloClientMethods {
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

  addSmartQuery<R = any>(key: string, options: VueApolloQueryDefinition<R>): SmartQuery<V>
  addSmartSubscription<R = any>(key: string, options: VueApolloSubscriptionDefinition): SmartSubscription<V>
}
