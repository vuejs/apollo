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
} from 'apollo-client'
import { FetchResult } from 'apollo-link'
import { ServerError, ServerParseError } from 'apollo-link-http-common'
import { DocumentNode, GraphQLError } from 'graphql'
import { DeepApplyThisType } from './utils'

/* Component options */

export interface AllVueApolloComponentSpecialOptions {
  $skip: boolean
  $skipAllQueries: boolean
  $skipAllSubscriptions: boolean
  $deep: boolean
  $client: string
  $loadingKey: string
  $watchLoading: WatchLoading
  $error: ErrorHandler
  $query: Partial<VueApolloQueryDefinition>
  $subscribe: VueApolloSubscriptionProperty
}

export type VueApolloComponentSpecialOptions =
  Partial<AllVueApolloComponentSpecialOptions>

interface PrivateVueApolloComponentOptions
 extends VueApolloComponentSpecialOptions {
  [key: string] : VueApolloQueryProperty |
    VueApolloComponentSpecialOptions[keyof VueApolloComponentSpecialOptions]
}

export type VueApolloComponentOptions<Instance> = DeepApplyThisType<PrivateVueApolloComponentOptions, Instance>

/* Special component options */

export type WatchLoading = (isLoading: boolean, countModifier: number) => void
export type ErrorHandler = (error: ApolloError) => void

/* Query */

type QueryVariables = (() => OperationVariables) | OperationVariables

export type VueApolloQueryProperty =
  DocumentNode |
  VueApolloQueryDefinition |
  (() => VueApolloQueryDefinition | null)

// exclude query prop because it causes type incorrectly error
type WatchQueryOptionsWithoutQuery = Omit<WatchQueryOptions, 'query'>

export interface VueApolloQueryDefinition<Result = any> extends WatchQueryOptionsWithoutQuery {
  query: DocumentNode | (() => DocumentNode | null)
  variables?: QueryVariables
  update?: (data: Result) => any
  result?: (result: ApolloQueryResult<Result>, key: string) => void
  error?: ErrorHandler
  manual?: boolean
  loadingKey?: string
  watchLoading?: WatchLoading
  skip?: (() => boolean) | boolean
  prefetch?: ((context: any) => any) | boolean
  client?: string
  deep?: boolean
  subscribeToMore?: VueApolloSubscribeToMoreOptions | VueApolloSubscribeToMoreOptions[]
}

/* Subscriptions */

interface VueApolloSubscribeToMoreOptions extends SubscribeToMoreOptions {
  variables?: QueryVariables
}

interface VueApolloSubscriptionDefinition extends SubscriptionOptions {
  variables?: QueryVariables
  client?: string
}

export type VueApolloSubscriptionProperty =
  VueApolloSubscriptionDefinition |
  { [key: string]: VueApolloSubscriptionDefinition }
