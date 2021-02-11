import {
  WatchQueryOptions,
  OperationVariables,
  SubscriptionOptions,
  SubscribeToMoreOptions,
  ApolloQueryResult,
  ApolloError,
} from '@apollo/client/core'
import { DocumentNode } from 'graphql'
// import { DeepApplyThisType } from './utils'

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

interface PrivateVueApolloComponentOptions extends VueApolloComponentSpecialOptions {
  [key: string] : VueApolloQueryProperty |
  VueApolloComponentSpecialOptions[keyof VueApolloComponentSpecialOptions]
}

// DeepApplyThisType is buggy: https://github.com/microsoft/TypeScript/issues/33392
// export type VueApolloComponentOptions<Instance> = DeepApplyThisType<PrivateVueApolloComponentOptions, Instance>
export type VueApolloComponentOptions<Instance> = PrivateVueApolloComponentOptions & ThisType<Instance>

/* Special component options */

export type WatchLoading = (isLoading: boolean, countModifier: number) => void
export type ErrorHandler = (error: ApolloError) => void

/* Query */

type QueryVariables<Variables = OperationVariables> = (() => Variables) | Variables

export type VueApolloQueryProperty =
  DocumentNode |
  VueApolloQueryDefinition |
  (() => VueApolloQueryDefinition | null)

// exclude query prop because it causes type incorrectly error
type WatchQueryOptionsWithoutQuery = Omit<WatchQueryOptions, 'query'>

export interface VueApolloQueryDefinition<Result = any, Variables = OperationVariables> extends WatchQueryOptionsWithoutQuery {
  query: DocumentNode | (() => DocumentNode | null)
  variables?: QueryVariables<Variables>
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
  subscribeToMore?: VueApolloSubscribeToMoreOptions<Result, Variables> | VueApolloSubscribeToMoreOptions<Result, Variables>[]
}

/* Subscriptions */

export interface VueApolloSubscribeToMoreOptions<Result = any, Variables = OperationVariables> extends Omit<SubscribeToMoreOptions<Result, Variables>, 'variables'> {
  variables?: QueryVariables<Variables>
}

export interface VueApolloSubscriptionDefinition<Variables = OperationVariables> extends Omit<SubscriptionOptions<Variables>, 'variables'> {
  variables?: QueryVariables<Variables>
  client?: string
}

export type VueApolloSubscriptionProperty =
  VueApolloSubscriptionDefinition |
  { [key: string]: VueApolloSubscriptionDefinition }
