import './vue'
import './gql'
import { ApolloProvider, ApolloProviderOptions } from './apollo-provider'

export { ApolloProvider }
export function createApolloProvider (options: ApolloProviderOptions): ApolloProvider
