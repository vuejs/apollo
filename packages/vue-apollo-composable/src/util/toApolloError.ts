import { ApolloError, isApolloError } from '@apollo/client'

export function toApolloError (error: unknown): ApolloError {
  if (!(error instanceof Error)) {
    return new ApolloError({
      networkError: Object.assign(new Error(), { originalError: error }),
      errorMessage: String(error),
    })
  }

  if (isApolloError(error)) {
    return error
  }

  return new ApolloError({ networkError: error, errorMessage: error.message })
}
