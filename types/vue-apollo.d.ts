import Vue, { PluginObject, PluginFunction } from 'vue';
import { ApolloClient, ObservableQuery } from 'apollo-client';
import { ApolloProvider, VueApolloComponent } from './apollo-provider'
import {
  VueApolloQueryOptions,
  VueApolloSubscriptionOptions,
  VueApolloOptions,
  WatchLoading,
  ErrorHandler
} from './options'

export class VueApollo extends ApolloProvider implements PluginObject<{}>{
  [key: string]: any;
  install: PluginFunction<{}>;
  constructor (options: {
    defaultClient: ApolloClient<{}>,
    defaultOptions?: VueApolloOptions<{}>,
    clients?: { [key: string]: ApolloClient<{}> },
    watchLoading?: WatchLoading<{}>,
    errorHandler?: ErrorHandler<{}>
  });
  static install(pVue: typeof Vue, options?:{} | undefined): void;
}

interface SmartApollo<V, R=any> {
  skip: boolean;
  refresh(): void;
  start(): void;
  stop(): void;
}

export interface SmartQuery<V, R=any> extends SmartApollo<V, R> {
  loading: boolean;
  fetchMore: ObservableQuery<any>['fetchMore'];
  subscribeToMore: ObservableQuery<any>['subscribeToMore'];
  refetch: ObservableQuery<any>['refetch'];
  setVariables: ObservableQuery<any>['setVariables'];
  setOptions: ObservableQuery<any>['setOptions'];
  startPolling: ObservableQuery<any>['startPolling'];
  stopPolling: ObservableQuery<any>['stopPolling'];
}

export interface SmartSubscription<V, R=any> extends SmartApollo<V, R> {
}

export interface DollarApollo<V> {
  vm: V;
  queries: Record<string, SmartQuery<V, any>>;
  subscriptions: Record<string, SmartSubscription<V, any>>;
  client: ApolloClient<{}>;
  readonly provider: ApolloProvider;
  readonly loading: boolean;

  // writeonly not yet implemented in TypeScript: https://github.com/Microsoft/TypeScript/issues/21759
  /* writeonly */ skipAllQueries: boolean;
  /* writeonly */ skipAllSubscriptions: boolean;
  /* writeonly */ skipAll: boolean;

  query: ApolloClient<{}>['query'];
  mutate: ApolloClient<{}>['mutate'];
  subscribe: ApolloClient<{}>['subscribe'];

  addSmartQuery<R=any>(key: string, options: VueApolloQueryOptions<V, R>): SmartQuery<V, R>;
  addSmartSubscription<R=any>(key: string, options: VueApolloSubscriptionOptions<V, R>): SmartSubscription<V, R>;
}

export function willPrefetch (component: VueApolloComponent, contextCallback?: boolean): VueApolloComponent