import Vue from 'vue'
import {
  WatchQueryOptions,
  OperationVariables,
  MutationOptions,
  SubscriptionOptions,
  SubscribeToMoreOptions,
  ObservableQuery,
  NetworkStatus,
  ApolloQueryResult,
  ApolloError
} from 'apollo-client';
import { FetchResult } from 'apollo-link';
import { ServerError, ServerParseError } from 'apollo-link-http-common';
import { DocumentNode, GraphQLError } from 'graphql';

/* Component options */

export interface AllVueApolloComponentSpecialOptions<Instance> {
  $skip: boolean
  $skipAllQueries: boolean
  $skipAllSubscriptions: boolean
  $deep: boolean
  $client: string
  $loadingKey: string
  $watchLoading: WatchLoading
  $error: ErrorHandler
  $query: Partial<VueApolloQueryDefinition<Instance>>
  $subscribe: VueApolloSubscriptionProperty
}

export type VueApolloComponentSpecialOptions<Instance> =
  Partial<AllVueApolloComponentSpecialOptions<Instance>>

export interface VueApolloComponentOptions<Instance>
 extends VueApolloComponentSpecialOptions<Instance> {
  [key: string] : VueApolloQueryProperty<Instance> |
    VueApolloComponentSpecialOptions<Instance>[keyof VueApolloComponentSpecialOptions<Instance>]
}

/* Special component options */

export type WatchLoading = (isLoading: boolean, countModifier: number) => void
export type ErrorHandler = (error: ApolloError) => void

/* Query */

type QueryVariables = (() => OperationVariables) | OperationVariables;

export type VueApolloQueryProperty<Instance> =
  DocumentNode |
  VueApolloQueryDefinition<Instance> |
  (() => VueApolloQueryDefinition<Instance> | null)

// exclude query prop because it causes type incorrectly error
type WatchQueryOptionsWithoutQuery = Omit<WatchQueryOptions, 'query'>;

export interface VueApolloQueryDefinition<Instance = Vue, R = any> extends WatchQueryOptionsWithoutQuery {
  query: DocumentNode | (() => DocumentNode | null)
  variables?: QueryVariables
  update?: (data: R) => any
  result?: (result: ApolloQueryResult<R>, key: string) => void
  error?: ErrorHandler
  manual?: boolean
  loadingKey?: string
  watchLoading?: WatchLoading
  skip?: (() => boolean) | boolean
  prefetch?: ((context: any) => any) | boolean
  client?: string
  deep?: boolean
  subscribeToMore?: VueApolloSubscribeToMoreOptions | (VueApolloSubscribeToMoreOptions & ThisType<Instance>)[]
}

/* Subscriptions */

interface VueApolloSubscribeToMoreOptions extends SubscribeToMoreOptions {
  variables?: QueryVariables;
}

interface VueApolloSubscriptionDefinition extends SubscriptionOptions {
  variables?: QueryVariables
  client?: string
}

export type VueApolloSubscriptionProperty =
  VueApolloSubscriptionDefinition |
  { [key: string]: VueApolloSubscriptionDefinition }
