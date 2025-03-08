import type { ApolloProviderOptions } from './apollo-provider'
import { ApolloProvider } from './apollo-provider'
import './vue'

export { ApolloProvider }
export function createApolloProvider(options: ApolloProviderOptions): ApolloProvider
