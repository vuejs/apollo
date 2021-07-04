import { ApolloProvider } from './apollo-provider'

export { ApolloProvider } from './apollo-provider'

export function createApolloProvider (options) {
  return new ApolloProvider(options)
}
