import type { GraphQLFormattedError } from 'graphql'
import { ApolloError, isApolloError } from '@apollo/client/core/index.js'

export function toApolloError(error: unknown): ApolloError {
  if (!(error instanceof Error)) {
    return new ApolloError({
      networkError: Object.assign(new Error((error as any)?.message), { originalError: error }),
      errorMessage: String(error),
    })
  }

  if (isApolloError(error)) {
    return error
  }

  return new ApolloError({ networkError: error, errorMessage: error.message })
}

export function resultErrorsToApolloError(errors: ReadonlyArray<GraphQLFormattedError>): ApolloError {
  return new ApolloError({
    graphQLErrors: errors,
    errorMessage: `GraphQL response contains errors: ${errors.map((e: any) => e.message).join(' | ')}`,
  })
}
