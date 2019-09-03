import {
  WatchQueryOptions,
  MutationOptions,
  SubscriptionOptions,
  SubscribeToMoreOptions,
  ObservableQuery,
  NetworkStatus,
  ApolloQueryResult,
} from 'apollo-client';
import { FetchResult } from 'apollo-link';
import { DocumentNode } from 'graphql';

// include Omit type from https://github.com/Microsoft/TypeScript/issues/12215
type Property = string | number | symbol;
type Diff<T extends Property, U extends Property> = ({ [P in T]: P } & { [P in U]: never } & { [x: string]: never })[T];
type Omit<T, K extends keyof T> = { [P in Diff<keyof T, K>]?: T[P] };

type VariableFn = (() => Object) | Object;
type ApolloVueUpdateQueryFn = (previousQueryResult: { [key: string]: any }, options: {
  error: any,
  subscriptionData: { data: any; };
  variables?: { [key: string]: any; };
}) => Object;

interface ApolloVueSubscribeToMoreOptions {
  document: DocumentNode;
  variables?: VariableFn;
  updateQuery?: ApolloVueUpdateQueryFn;
  onError?: (error: Error) => void;
}

export type WatchLoading = (isLoading: boolean, countModifier: number) => void
export type ErrorHandler = (error: any) => void

type _WatchQueryOptions = Omit<WatchQueryOptions, 'query'>; // exclude query prop because it causes type incorrectly error

interface ExtendableVueApolloQueryOptions<R> extends _WatchQueryOptions {
  update?: (data: R) => any;
  result?: (data: ApolloQueryResult<R>, loader: any, netWorkStatus: NetworkStatus) => void;
  error?: ErrorHandler;
  loadingKey?: string;
  watchLoading?: WatchLoading;
  skip?: (() => boolean) | boolean;
  manual?: boolean;
  subscribeToMore?: ApolloVueSubscribeToMoreOptions | ApolloVueSubscribeToMoreOptions[];
  prefetch?: ((context: any) => any) | boolean;
  deep?: boolean;
}
export interface VueApolloQueryOptions<R> extends ExtendableVueApolloQueryOptions<R> {
  query: (() => DocumentNode) | DocumentNode;
  variables?: VariableFn;
  client?: String
}

export interface VueApolloMutationOptions<R> extends MutationOptions<R> {
  mutation: DocumentNode;
  variables?: VariableFn;
  optimisticResponse?: (() => R) | R;
  client?: String
}

export interface VueApolloSubscriptionOptions<R> extends SubscriptionOptions {
  query: DocumentNode;
  variables?: VariableFn;
  skip?: () => boolean | boolean;
  result?: (data: FetchResult<R>) => void;
}

type QueryComponentProperty = (() => VueApolloQueryOptions<any>) | VueApolloQueryOptions<any>
type SubscribeComponentProperty = VueApolloSubscriptionOptions<any> | { [key: string]: VueApolloSubscriptionOptions<any> }

export type VueApolloOptions<V> = {
  $skip?: boolean,
  $skipAllQueries?: boolean,
  $skipAllSubscriptions?: boolean,
  $deep?: boolean,
  $client?: string,
  $loadingKey?: string,
  $watchLoading?: WatchLoading,
  $error?: ErrorHandler,
  $query?: ExtendableVueApolloQueryOptions<any>
}

export interface VueApolloComponentOption<V> extends VueApolloOptions<V> {
  [key: string]: QueryComponentProperty | SubscribeComponentProperty | ExtendableVueApolloQueryOptions<any> | string | boolean | Function | undefined;
  $subscribe?: SubscribeComponentProperty;
}
