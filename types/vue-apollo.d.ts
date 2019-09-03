import Vue, { PluginObject, PluginFunction } from 'vue';
import { ApolloClient, ObservableQuery, ApolloQueryResult } from 'apollo-client';
import { FetchResult } from 'apollo-link';
import { Observable } from 'apollo-client/util/Observable';
import { ApolloProvider, VueApolloComponent } from './apollo-provider'
import {
  VueApolloQueryOptions,
  VueApolloMutationOptions,
  VueApolloSubscriptionOptions,
  VueApolloOptions,
  WatchLoading,
  ErrorHandler,
} from './options';
import { GraphQLError } from 'graphql';

export class VueApollo extends ApolloProvider implements PluginObject<{}>{
  [key: string]: any;
  install: PluginFunction<{}>;

  static install(pVue: typeof Vue, options?:{} | undefined): void;
}

interface SmartApollo {
  skip: boolean;
  refresh(): void;
  start(): void;
  stop(): void;
}

export interface SmartQuery extends SmartApollo {
  loading: boolean;
  fetchMore: ObservableQuery<any>['fetchMore'];
  subscribeToMore: ObservableQuery<any>['subscribeToMore'];
  refetch: ObservableQuery<any>['refetch'];
  setVariables: ObservableQuery<any>['setVariables'];
  setOptions: ObservableQuery<any>['setOptions'];
  startPolling: ObservableQuery<any>['startPolling'];
  stopPolling: ObservableQuery<any>['stopPolling'];
}

export interface SmartSubscription extends SmartApollo {
}

export interface DollarApollo<V> {
  vm: V;
  queries: Record<string, SmartQuery>
  subscriptions: Record<string, SmartSubscription>
  readonly provider: ApolloProvider
  readonly loading: boolean;

  // writeonly not yet implemented in TypeScript: https://github.com/Microsoft/TypeScript/issues/21759
  /* writeonly */ skipAllQueries: boolean;
  /* writeonly */ skipAllSubscriptions: boolean;
  /* writeonly */ skipAll: boolean;

  query<R=any>(options: VueApolloQueryOptions<R>): Promise<ApolloQueryResult<R>>;
  mutate<R=any>(options: VueApolloMutationOptions<R>): Promise<FetchResult<R>>;
  subscribe<R=any>(options: VueApolloSubscriptionOptions<R>): Observable<FetchResult<R>>;

  addSmartQuery<R=any>(key: string, options: VueApolloQueryOptions<R>): SmartQuery;
  addSmartSubscription<R=any>(key: string, options: VueApolloSubscriptionOptions<R>): SmartSubscription;
}

export function willPrefetch (component: VueApolloComponent, contextCallback?: boolean): VueApolloComponent
