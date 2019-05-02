import { WatchQueryOptions, MutationOptions, SubscriptionOptions, SubscribeToMoreOptions, ObservableQuery, NetworkStatus } from 'apollo-client'
import { DocumentNode } from 'graphql';

// include Omit type from https://github.com/Microsoft/TypeScript/issues/12215
type Property = string | number | symbol;
type Diff<T extends Property, U extends Property> = ({ [P in T]: P } & { [P in U]: never } & { [x: string]: never })[T];
type Omit<T, K extends keyof T> = { [P in Diff<keyof T, K>]?: T[P] };

type ApolloVueThisType<V> = V & { [key: string]: any };
type VariableFn<V> = ((this: ApolloVueThisType<V>) => Object) | Object;
type ApolloVueUpdateQueryFn<V> = (this: ApolloVueThisType<V>, previousQueryResult: { [key: string]: any }, options: {
  error: any,
  subscriptionData: { data: any; };
  variables?: { [key: string]: any; };
}) => Object;

interface ApolloVueSubscribeToMoreOptions<V> {
  document: DocumentNode;
  variables?: VariableFn<V>;
  updateQuery?: ApolloVueUpdateQueryFn<V>;
  onError?: (error: Error) => void;
}

export type WatchLoading<V> = (this: ApolloVueThisType<V>, isLoading: boolean, countModifier: number) => void
export type ErrorHandler<V> = (this: ApolloVueThisType<V>, error: any) => void

type _WatchQueryOptions = Omit<WatchQueryOptions, 'query'>; // exclude query prop because it causes type incorrectly error

interface ExtendableVueApolloQueryOptions<V, R> extends _WatchQueryOptions {
  update?: (this: ApolloVueThisType<V>, data: R) => any;
  result?: (this: ApolloVueThisType<V>, data: R, loader: any, netWorkStatus: NetworkStatus) => void;
  error?: ErrorHandler<V>;
  loadingKey?: string;
  watchLoading?: WatchLoading<V>;
  skip?: ((this: ApolloVueThisType<V>) => boolean) | boolean;
  manual?: boolean;
  subscribeToMore?: ApolloVueSubscribeToMoreOptions<V> | ApolloVueSubscribeToMoreOptions<V>[];
  prefetch?: ((context: any) => any) | boolean;
  deep?: boolean;
}
export interface VueApolloQueryOptions<V, R> extends ExtendableVueApolloQueryOptions<V, R> {
  query: ((this: ApolloVueThisType<V>) => DocumentNode) | DocumentNode;
  variables?: VariableFn<V>;
  client?: String
}

export interface VueApolloMutationOptions<V, R> extends MutationOptions<R> {
  mutation: DocumentNode;
  variables?: VariableFn<V>;
  optimisticResponse?: ((this: ApolloVueThisType<V>) => any) | Object;
}

export interface VueApolloSubscriptionOptions<V, R> extends SubscriptionOptions {
  query: DocumentNode;
  variables?: VariableFn<V>;
  result?: (this: V, data: R) => void;
}

type QueryComponentProperty<V> = ((this: ApolloVueThisType<V>) => VueApolloQueryOptions<V, any>) | VueApolloQueryOptions<V, any>
type SubscribeComponentProperty<V> = VueApolloSubscriptionOptions<V, any> | { [key: string]: VueApolloSubscriptionOptions<V, any> }

export type VueApolloOptions<V> = {
  $skip?: boolean,
  $skipAllQueries?: boolean,
  $skipAllSubscriptions?: boolean,
  $deep?: boolean,
  $client?: string,
  $loadingKey?: string,
  $watchLoading?: WatchLoading<V>,
  $error?: ErrorHandler<V>,
  $query?: ExtendableVueApolloQueryOptions<V, any>
}

export interface VueApolloComponentOption<V> extends VueApolloOptions<V> {
  [key: string]: QueryComponentProperty<V> | SubscribeComponentProperty<V> | ExtendableVueApolloQueryOptions<V, any> | string | boolean | Function | undefined;
  $subscribe?: SubscribeComponentProperty<V>;
}
