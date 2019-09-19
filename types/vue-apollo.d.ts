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
